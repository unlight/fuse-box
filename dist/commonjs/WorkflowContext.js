"use strict";
const path = require("path");
const fs = require("fs");
const BundleSource_1 = require("./BundleSource");
const File_1 = require("./File");
const Log_1 = require("./Log");
const PathMaster_1 = require("./PathMaster");
const ModuleCache_1 = require("./ModuleCache");
const realm_utils_1 = require("realm-utils");
const EventEmitter_1 = require("./EventEmitter");
const Utils_1 = require("./Utils");
const appRoot = require("app-root-path");
class WorkFlowContext {
    constructor() {
        this.sourceChangedEmitter = new EventEmitter_1.EventEmitter();
        this.defaultPackageName = "default";
        this.ignoreGlobal = [];
        this.pendingPromises = [];
        this.serverBundle = false;
        this.nodeModules = new Map();
        this.libPaths = new Map();
        this.printLogs = true;
        this.useCache = true;
        this.doLog = true;
        this.tsMode = false;
        this.standaloneBundle = true;
        this.initialLoad = true;
        this.debugMode = false;
        this.log = new Log_1.Log(this);
    }
    initCache() {
        this.cache = new ModuleCache_1.ModuleCache(this);
    }
    getHeaderImportsConfiguration() {
    }
    emitJavascriptHotReload(file) {
        this.sourceChangedEmitter.emit({
            type: "js",
            content: file.contents,
            path: file.info.fuseBoxPath,
        });
    }
    debug(group, text) {
        if (this.debugMode) {
            this.log.echo(`${group} : ${text}`);
        }
    }
    warning(str) {
        return this.log.echoWarning(str);
    }
    fatal(str) {
        throw new Error(str);
    }
    debugPlugin(plugin, text) {
        const name = plugin.constructor && plugin.constructor.name ? plugin.constructor.name : "Unknown";
        this.debug(name, text);
    }
    isShimed(name) {
        if (!this.shim) {
            return false;
        }
        return this.shim[name] !== undefined;
    }
    reset() {
        this.log = new Log_1.Log(this);
        this.storage = new Map();
        this.source = new BundleSource_1.BundleSource(this);
        this.nodeModules = new Map();
        this.pluginTriggers = new Map();
        this.fileGroups = new Map();
        this.libPaths = new Map();
    }
    setItem(key, obj) {
        this.storage.set(key, obj);
    }
    getItem(key) {
        return this.storage.get(key);
    }
    createFileGroup(name, collection, handler) {
        let info = {
            fuseBoxPath: name,
            absPath: name,
        };
        let file = new File_1.File(this, info);
        file.collection = collection;
        file.contents = "";
        file.groupMode = true;
        file.groupHandler = handler;
        this.fileGroups.set(name, file);
        return file;
    }
    getFileGroup(name) {
        return this.fileGroups.get(name);
    }
    allowExtension(ext) {
        if (!PathMaster_1.AllowedExtenstions.has(ext)) {
            PathMaster_1.AllowedExtenstions.add(ext);
        }
    }
    setHomeDir(dir) {
        this.homeDir = dir;
    }
    setLibInfo(name, version, info) {
        let key = `${name}@${version}`;
        if (!this.libPaths.has(key)) {
            return this.libPaths.set(key, info);
        }
    }
    convert2typescript(name) {
        return name.replace(/\.ts$/, '.js');
    }
    getLibInfo(name, version) {
        let key = `${name}@${version}`;
        if (this.libPaths.has(key)) {
            return this.libPaths.get(key);
        }
    }
    setPrintLogs(printLogs) {
        this.printLogs = printLogs;
    }
    setUseCache(useCache) {
        this.useCache = useCache;
    }
    hasNodeModule(name) {
        return this.nodeModules.has(name);
    }
    isGlobalyIgnored(name) {
        return this.ignoreGlobal.indexOf(name) > -1;
    }
    addNodeModule(name, collection) {
        this.nodeModules.set(name, collection);
    }
    getTypeScriptConfig() {
        if (this.loadedTsConfig) {
            return this.loadedTsConfig;
        }
        let url, configFile;
        let config = {
            compilerOptions: {}
        };
        ;
        if (this.tsConfig) {
            configFile = Utils_1.ensureUserPath(this.tsConfig);
        }
        else {
            url = path.join(this.homeDir, "tsconfig.json");
            let tsconfig = Utils_1.findFileBackwards(url, appRoot.path);
            if (tsconfig) {
                configFile = tsconfig;
            }
        }
        if (configFile) {
            this.log.echoStatus(`Typescript config:  ${configFile.replace(appRoot.path, '')}`);
            config = require(configFile);
        }
        else {
            this.log.echoStatus(`Typescript config file was not found. Improvising`);
        }
        config.compilerOptions.module = "commonjs";
        if (this.sourceMapConfig) {
            config.compilerOptions.sourceMap = true;
            config.compilerOptions.inlineSources = true;
        }
        this.loadedTsConfig = config;
        return config;
    }
    isFirstTime() {
        return this.initialLoad === true;
    }
    writeOutput(outFileWritten) {
        this.initialLoad = false;
        let res = this.source.getResult();
        if (this.sourceMapConfig && this.sourceMapConfig.outFile) {
            let target = Utils_1.ensureUserPath(this.sourceMapConfig.outFile);
            fs.writeFile(target, res.sourceMap, () => { });
        }
        if (this.outFile) {
            let target = Utils_1.ensureUserPath(this.outFile);
            fs.writeFile(target, res.content, () => {
                if (realm_utils_1.utils.isFunction(outFileWritten)) {
                    outFileWritten();
                }
            });
        }
    }
    getNodeModule(name) {
        return this.nodeModules.get(name);
    }
    triggerPluginsMethodOnce(name, args, fn) {
        this.plugins.forEach(plugin => {
            if (Array.isArray(plugin)) {
                plugin.forEach(p => {
                    if (realm_utils_1.utils.isFunction(p[name])) {
                        if (this.pluginRequiresTriggering(p, name)) {
                            p[name].apply(p, args);
                            if (fn) {
                                fn(p);
                            }
                        }
                    }
                });
            }
            if (realm_utils_1.utils.isFunction(plugin[name])) {
                if (this.pluginRequiresTriggering(plugin, name)) {
                    plugin[name].apply(plugin, args);
                    if (fn) {
                        fn(plugin);
                    }
                }
            }
        });
    }
    pluginRequiresTriggering(cls, method) {
        if (!cls.constructor) {
            return true;
        }
        let name = cls.constructor.name;
        if (!this.pluginTriggers.has(name)) {
            this.pluginTriggers.set(name, new Set());
        }
        let items = this.pluginTriggers.get(name);
        if (!items.has(method)) {
            items.add(method);
            return true;
        }
        return false;
    }
}
exports.WorkFlowContext = WorkFlowContext;
