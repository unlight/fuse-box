"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
let stylus;
class StylusPluginClass {
    constructor(options) {
        this.test = /\.styl$/;
        this.options = options || {};
    }
    init(context) {
        context.allowExtension('.styl');
    }
    transform(file) {
        const context = file.context;
        const options = __assign({}, this.options);
        const sourceMapDef = {
            comment: false,
            sourceRoot: file.info.absDir
        };
        file.loadContents();
        if (!stylus)
            stylus = require('stylus');
        options.filename = file.info.fuseBoxPath;
        if ('sourceMapConfig' in context) {
            options.sourcemap = __assign({}, sourceMapDef, this.options.sourcemap || {});
        }
        return new Promise((res, rej) => {
            const renderer = stylus(file.contents, options);
            return renderer.render((err, css) => {
                if (err)
                    return rej(err);
                if (renderer.sourcemap) {
                    file.sourceMap = JSON.stringify(renderer.sourcemap);
                }
                file.contents = css;
                return res(css);
            });
        });
    }
}
exports.StylusPluginClass = StylusPluginClass;
exports.StylusPlugin = (options) => {
    return new StylusPluginClass(options);
};
