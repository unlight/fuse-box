"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
let less;
class LESSPluginClass {
    constructor(options) {
        this.test = /\.less$/;
        this.options = options || {};
    }
    init(context) {
        context.allowExtension(".less");
    }
    transform(file) {
        const context = file.context;
        const options = __assign({}, this.options);
        file.loadContents();
        const sourceMapDef = {
            sourceMapBasepath: '.',
            sourceMapRootpath: file.info.absDir
        };
        if (!less) {
            less = require("less");
        }
        options.filename = file.info.fuseBoxPath;
        if ('sourceMapConfig' in context) {
            options.sourceMap = __assign({}, sourceMapDef, options.sourceMap || {});
        }
        return less.render(file.contents, options).then(output => {
            if (output.map) {
                file.sourceMap = output.map;
            }
            file.contents = output.css;
        });
    }
}
exports.LESSPluginClass = LESSPluginClass;
exports.LESSPlugin = (opts) => {
    return new LESSPluginClass(opts);
};