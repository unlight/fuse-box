"use strict";
const FileAnalysis_1 = require("./FileAnalysis");
const fs = require("fs");
const realm_utils_1 = require("realm-utils");
class File {
    constructor(context, info) {
        this.context = context;
        this.info = info;
        this.isFuseBoxBundle = false;
        this.isLoaded = false;
        this.isNodeModuleEntry = false;
        this.isTypeScript = false;
        this.properties = new Map();
        this.analysis = new FileAnalysis_1.FileAnalysis(this);
        this.resolving = [];
        this.subFiles = [];
        this.groupMode = false;
        if (info.params) {
            this.params = info.params;
        }
        this.absPath = info.absPath;
    }
    addProperty(key, obj) {
        this.properties.set(key, obj);
    }
    getProperty(key) {
        return this.properties.get(key);
    }
    hasSubFiles() {
        return this.subFiles.length > 0;
    }
    addSubFile(file) {
        this.subFiles.push(file);
    }
    getCrossPlatormPath() {
        let name = this.absPath;
        if (!name) {
            return;
        }
        name = name.replace(/\\/g, "/");
        return name;
    }
    asyncResolve(promise) {
        this.resolving.push(promise);
    }
    tryTypescriptPlugins() {
        if (this.context.plugins) {
            this.context.plugins.forEach((plugin) => {
                if (realm_utils_1.utils.isFunction(plugin.onTypescriptTransform)) {
                    plugin.onTypescriptTransform(this);
                }
            });
        }
    }
    tryPlugins(_ast) {
        if (this.context.plugins) {
            let target;
            let index = 0;
            while (!target && index < this.context.plugins.length) {
                let item = this.context.plugins[index];
                let itemTest;
                if (Array.isArray(item)) {
                    let el = item[0];
                    if (el && typeof el.test === "function") {
                        itemTest = el;
                    }
                    else {
                        itemTest = el.test;
                    }
                }
                else {
                    itemTest = item.test;
                }
                if (itemTest && realm_utils_1.utils.isFunction(itemTest.test) && itemTest.test(this.absPath)) {
                    target = item;
                }
                index++;
            }
            if (target) {
                if (Array.isArray(target)) {
                    let context = this.context;
                    if (context.useCache) {
                        let cached = context.cache.getStaticCache(this);
                        if (cached) {
                            this.isLoaded = true;
                            this.contents = cached.contents;
                            this.sourceMap = cached.sourceMap;
                            return;
                        }
                    }
                    this.asyncResolve(realm_utils_1.each(target, (plugin) => {
                        if (this.groupMode && realm_utils_1.utils.isFunction(plugin.transformGroup)) {
                            return plugin.transformGroup.apply(plugin, [this]);
                        }
                        if (realm_utils_1.utils.isFunction(plugin.transform)) {
                            return plugin.transform.apply(plugin, [this]);
                        }
                    }));
                    if (context.useCache) {
                        Promise.all(this.resolving).then(() => {
                            context.sourceChangedEmitter.emit({
                                type: null,
                                content: this.contents,
                                path: this.info.fuseBoxPath,
                            });
                            context.cache.writeStaticCache(this, this.sourceMap);
                        });
                    }
                }
                else {
                    if (this.groupMode && realm_utils_1.utils.isFunction(target.transformGroup)) {
                        return this.asyncResolve(target.transformGroup.apply(target, [this]));
                    }
                    if (realm_utils_1.utils.isFunction(target.transform)) {
                        return this.asyncResolve(target.transform.apply(target, [this]));
                    }
                }
            }
        }
    }
    addHeaderContent(str) {
        if (!this.headerContent) {
            this.headerContent = [];
        }
        this.headerContent.push(str);
    }
    loadContents() {
        if (this.isLoaded) {
            return;
        }
        this.contents = fs.readFileSync(this.info.absPath).toString();
        this.isLoaded = true;
    }
    makeAnalysis(parserOptions) {
        if (!this.analysis.astIsLoaded()) {
            this.analysis.parseUsingAcorn(parserOptions);
        }
        this.analysis.analyze();
    }
    consume() {
        if (this.info.isRemoteFile) {
            return;
        }
        if (!this.absPath) {
            return;
        }
        if (!fs.existsSync(this.info.absPath)) {
            this.notFound = true;
            return;
        }
        if (/\.ts(x)?$/.test(this.absPath)) {
            return this.handleTypescript();
        }
        if (/\.js(x)?$/.test(this.absPath)) {
            this.loadContents();
            this.tryPlugins();
            this.makeAnalysis();
            return;
        }
        this.tryPlugins();
        if (!this.isLoaded) {
            throw { message: `File contents for ${this.absPath} were not loaded. Missing a plugin?` };
        }
    }
    handleTypescript() {
        if (this.context.useCache) {
            let cached = this.context.cache.getStaticCache(this);
            if (cached) {
                this.isLoaded = true;
                this.sourceMap = cached.sourceMap;
                this.contents = cached.contents;
                if (cached.headerContent) {
                    this.headerContent = cached.headerContent;
                }
                this.analysis.dependencies = cached.dependencies;
                this.tryPlugins();
                return;
            }
        }
        const ts = require("typescript");
        this.loadContents();
        this.tryTypescriptPlugins();
        let result = ts.transpileModule(this.contents, this.getTranspilationConfig());
        if (result.sourceMapText && this.context.sourceMapConfig) {
            let jsonSourceMaps = JSON.parse(result.sourceMapText);
            jsonSourceMaps.file = this.info.fuseBoxPath;
            jsonSourceMaps.sources = [this.info.fuseBoxPath.replace(/\.js$/, ".ts")];
            result.outputText = result.outputText.replace("//# sourceMappingURL=module.js.map", "");
            this.sourceMap = JSON.stringify(jsonSourceMaps);
        }
        this.contents = result.outputText;
        this.makeAnalysis();
        this.tryPlugins();
        if (this.context.useCache) {
            let cachedContent = this.contents;
            if (this.headerContent) {
                cachedContent = this.headerContent.join("\n") + "\n" + cachedContent;
            }
            this.context.sourceChangedEmitter.emit({
                type: "js",
                content: cachedContent,
                path: this.info.fuseBoxPath,
            });
            this.context.cache.writeStaticCache(this, this.sourceMap);
        }
    }
    getTranspilationConfig() {
        return Object.assign({}, this.context.getTypeScriptConfig(), {
            fileName: this.info.absPath,
        });
    }
}
exports.File = File;
