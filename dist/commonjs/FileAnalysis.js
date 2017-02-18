"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const ASTTraverse_1 = require("./ASTTraverse");
const PrettyError_1 = require("./PrettyError");
const acorn = require("acorn");
const escodegen = require("escodegen");
require("acorn-es7")(acorn);
require("acorn-jsx/inject")(acorn);
class FileAnalysis {
    constructor(file) {
        this.file = file;
        this.wasAnalysed = false;
        this.skipAnalysis = false;
        this.fuseBoxVariable = "FuseBox";
        this.dependencies = [];
    }
    astIsLoaded() {
        return this.ast !== undefined;
    }
    loadAst(ast) {
        this.ast = ast;
    }
    skip() {
        this.skipAnalysis = true;
    }
    parseUsingAcorn(options) {
        try {
            this.ast = acorn.parse(this.file.contents, __assign({}, options || {}, {
                sourceType: "module",
                tolerant: true,
                ecmaVersion: 8,
                plugins: { es7: true, jsx: true },
                jsx: { allowNamespacedObjects: true }
            }));
        }
        catch (err) {
            return PrettyError_1.PrettyError.errorWithContents(err, this.file);
        }
    }
    analyze() {
        if (this.wasAnalysed || this.skipAnalysis) {
            return;
        }
        let out = {
            requires: [],
            processDeclared: false,
            processRequired: false,
            fuseBoxBundle: false,
            fuseBoxMain: undefined
        };
        let isString = (node) => {
            return node.type === "Literal" || node.type === "StringLiteral";
        };
        ASTTraverse_1.ASTTraverse.traverse(this.ast, {
            pre: (node, parent, prop, idx) => {
                if (node.type === "Identifier") {
                    if (node.name === "$fuse$") {
                        this.fuseBoxVariable = parent.object.name;
                    }
                }
                if (node.type === "MemberExpression") {
                    if (node.object && node.object.type === "Identifier") {
                        if (node.object.name === "process") {
                            out.processRequired = true;
                        }
                    }
                    if (parent.type === "CallExpression") {
                        if (node.object && node.object.type === "Identifier" && node.object.name === this.fuseBoxVariable) {
                            if (node.property && node.property.type === "Identifier") {
                                if (node.property.name === "main") {
                                    if (parent.arguments) {
                                        let f = parent.arguments[0];
                                        if (f && isString(f)) {
                                            out.fuseBoxMain = f.value;
                                            out.fuseBoxBundle = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (node.type === "VariableDeclarator") {
                    if (node.id && node.id.type === "Identifier" && node.id.name === "process") {
                        out.processDeclared = true;
                    }
                }
                if (node.type === "ImportDeclaration") {
                    if (node.source && isString(node.source)) {
                        out.requires.push(node.source.value);
                    }
                }
                if (node.type === "CallExpression" && node.callee) {
                    if (node.callee.type === "Identifier" && node.callee.name === "require") {
                        let arg1 = node.arguments[0];
                        if (isString(arg1)) {
                            out.requires.push(arg1.value);
                        }
                    }
                }
            }
        });
        out.requires.forEach(name => {
            this.dependencies.push(name);
        });
        if (!out.processDeclared) {
            if (out.processRequired) {
                this.dependencies.push("process");
                this.file.addHeaderContent(`var process = require("process");`);
            }
        }
        if (out.fuseBoxBundle) {
            this.dependencies = [];
            this.file.isFuseBoxBundle = true;
            this.removeFuseBoxApiFromBundle();
            if (out.fuseBoxMain) {
                const externalCollection = this.file.collection.name !== this.file.context.defaultPackageName;
                if (externalCollection) {
                    this.file.collection.acceptFiles = false;
                }
                else {
                    this.file.alternativeContent = `module.exports = require("${out.fuseBoxMain}")`;
                }
            }
        }
        this.wasAnalysed = true;
    }
    removeFuseBoxApiFromBundle() {
        let ast = this.ast;
        let modifiedAst;
        if (ast.type === "Program") {
            let first = ast.body[0];
            if (first && first.type === "ExpressionStatement") {
                let expression = first.expression;
                if (expression.type === "UnaryExpression" && expression.operator === "!") {
                    expression = expression.argument || {};
                }
                if (expression.type === "CallExpression") {
                    let callee = expression.callee;
                    if (callee.type === "FunctionExpression") {
                        if (callee.params && callee.params[0]) {
                            let param1 = callee.params[0];
                            if (param1.type === "Identifier" && param1.name === this.fuseBoxVariable) {
                                modifiedAst = callee.body;
                            }
                        }
                    }
                }
            }
        }
        if (modifiedAst) {
            this.file.contents = `(function(${this.fuseBoxVariable})${escodegen.generate(modifiedAst)})(FuseBox);`;
        }
    }
}
exports.FileAnalysis = FileAnalysis;
