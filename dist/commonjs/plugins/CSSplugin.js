"use strict";
const fs = require("fs");
const path = require("path");
const Config_1 = require("./../Config");
const realm_utils_1 = require("realm-utils");
const CSSPluginDeprecated_1 = require("./CSSPluginDeprecated");
class CSSPluginClass {
    constructor(opts) {
        this.test = /\.css$/;
        this.raw = false;
        this.minify = false;
        opts = opts || {};
        if (opts.raw !== undefined) {
            this.raw = opts.raw;
        }
        if (opts.write) {
            this.writeOptions = opts.write;
        }
        if (opts.bundle) {
            this.bundle = opts.bundle;
        }
        if (opts.minify !== undefined) {
            this.minify = opts.minify;
        }
        if (opts.serve !== undefined) {
            this.serve = opts.serve;
        }
    }
    init(context) {
        context.allowExtension(".css");
    }
    bundleStart(context) {
        let lib = path.join(Config_1.Config.FUSEBOX_MODULES, "fsbx-default-css-plugin", "index.js");
        context.source.addContent(fs.readFileSync(lib).toString());
    }
    transform(file) {
        file.loadContents();
        let contents;
        let filePath = file.info.fuseBoxPath;
        let serve = false;
        let context = file.context;
        if (this.bundle) {
            let fileGroup = context.getFileGroup(this.bundle);
            if (!fileGroup) {
                fileGroup = context.createFileGroup(this.bundle);
            }
            fileGroup.addSubFile(file);
            file.alternativeContent = `module.exports = require("./${this.bundle}")`;
            return;
        }
        if (this.writeOptions) {
            const writeResult = CSSPluginDeprecated_1.CSSPluginDeprecated.writeOptions(this.writeOptions, file);
            if (writeResult) {
                return writeResult;
            }
        }
        else {
            file.sourceMap = undefined;
        }
        if (this.serve) {
            if (realm_utils_1.utils.isFunction(this.serve)) {
                let userResult = this.serve(file.info.fuseBoxPath, file);
                if (realm_utils_1.utils.isString(userResult)) {
                    filePath = userResult;
                    serve = true;
                }
            }
        }
        if (serve) {
            contents = `__fsbx_css("${filePath}")`;
        }
        else {
            let cssContent = this.minify ? this.minifyContents(file.contents) : file.contents;
            let safeContents = JSON.stringify(cssContent);
            file.context.sourceChangedEmitter.emit({
                type: "css",
                content: cssContent,
                path: file.info.fuseBoxPath,
            });
            contents = `__fsbx_css("${filePath}", ${safeContents});`;
        }
        const chainExports = file.getProperty("exports");
        if (chainExports && contents) {
            contents += `module.exports = ${chainExports}`;
        }
        file.contents = contents;
    }
    minifyContents(contents) {
        return contents.replace(/\s{2,}/g, " ").replace(/\t|\r|\n/g, "").trim();
    }
}
exports.CSSPluginClass = CSSPluginClass;
exports.CSSPlugin = (opts) => {
    return new CSSPluginClass(opts);
};
