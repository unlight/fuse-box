"use strict";
const fs = require("fs");
const path = require("path");
const appRoot = require("app-root-path");
let babelCore;
class BabelPluginClass {
    constructor(opts) {
        this.test = /\.(j|t)s(x)?$/;
        this.limit2project = true;
        this.config = {};
        let babelRcConfig;
        let babelRcPath = path.join(appRoot.path, `.babelrc`);
        if (fs.existsSync(babelRcPath)) {
            babelRcConfig = fs.readFileSync(babelRcPath).toString();
            if (babelRcConfig)
                babelRcConfig = JSON.parse(babelRcConfig);
        }
        opts = opts || {};
        this.config = opts.config ? opts.config : babelRcConfig;
        if (opts.test !== undefined) {
            this.test = opts.test;
        }
        if (opts.limit2project !== undefined) {
            this.limit2project = opts.limit2project;
        }
    }
    init(context) {
        this.context = context;
        context.allowExtension(".jsx");
    }
    transform(file, ast) {
        if (!babelCore) {
            babelCore = require("babel-core");
        }
        if (this.context.useCache) {
            let cached = this.context.cache.getStaticCache(file);
            if (cached) {
                if (cached.sourceMap) {
                    file.sourceMap = cached.sourceMap;
                }
                file.analysis.skip();
                file.analysis.dependencies = cached.dependencies;
                file.contents = cached.contents;
                return;
            }
        }
        if (this.limit2project === false || file.collection.name === file.context.defaultPackageName) {
            let result = babelCore.transform(file.contents, this.config);
            if (result.ast) {
                file.analysis.loadAst(result.ast);
                file.analysis.analyze();
                file.contents = result.code;
                if (result.map) {
                    let sm = result.map;
                    sm.file = file.info.fuseBoxPath;
                    sm.sources = [file.info.fuseBoxPath];
                    file.sourceMap = JSON.stringify(sm);
                }
                if (this.context.useCache) {
                    this.context.emitJavascriptHotReload(file);
                    this.context.cache.writeStaticCache(file, file.sourceMap);
                }
            }
        }
    }
}
exports.BabelPluginClass = BabelPluginClass;
;
exports.BabelPlugin = (opts) => {
    return new BabelPluginClass(opts);
};