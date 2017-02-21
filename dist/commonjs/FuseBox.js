"use strict";
const fs = require("fs");
const Utils_1 = require("./Utils");
const ShimCollection_1 = require("./ShimCollection");
const Server_1 = require("./devServer/Server");
const JSONplugin_1 = require("./plugins/JSONplugin");
const PathMaster_1 = require("./PathMaster");
const WorkflowContext_1 = require("./WorkflowContext");
const CollectionSource_1 = require("./CollectionSource");
const Arithmetic_1 = require("./Arithmetic");
const ModuleCollection_1 = require("./ModuleCollection");
const path = require("path");
const realm_utils_1 = require("realm-utils");
const Config_1 = require("./Config");
const BundleTestRunner_1 = require("./testRunner/BundleTestRunner");
const process = require("process");
const HeaderImport_1 = require("./HeaderImport");
const appRoot = require("app-root-path");
class FuseBox {
    constructor(opts) {
        this.opts = opts;
        this.context = new WorkflowContext_1.WorkFlowContext();
        this.collectionSource = new CollectionSource_1.CollectionSource(this.context);
        opts = opts || {};
        let homeDir = appRoot.path;
        if (opts.homeDir) {
            homeDir = path.isAbsolute(opts.homeDir) ? opts.homeDir : path.join(appRoot.path, opts.homeDir);
        }
        if (opts.debug !== undefined) {
            this.context.debugMode = opts.debug;
        }
        this.context.debugMode = opts.debug !== undefined ? opts.debug : Utils_1.contains(process.argv, '--debug');
        if (opts.modulesFolder) {
            this.context.customModulesFolder =
                path.isAbsolute(opts.modulesFolder)
                    ? opts.modulesFolder : path.join(appRoot.path, opts.modulesFolder);
        }
        if (opts.transformTypescript) {
            this.context.transformTypescript = opts.transformTypescript;
        }
        if (opts.tsConfig) {
            this.context.tsConfig = opts.tsConfig;
        }
        if (opts.serverBundle !== undefined) {
            this.context.serverBundle = opts.serverBundle;
        }
        this.context.plugins = opts.plugins || [JSONplugin_1.JSONPlugin()];
        if (opts.package) {
            this.context.defaultPackageName = opts.package;
        }
        if (opts.cache !== undefined) {
            this.context.useCache = opts.cache ? true : false;
        }
        if (opts.log !== undefined) {
            this.context.doLog = opts.log ? true : false;
        }
        if (opts.alias) {
            this.context.aliasCollection = opts.alias;
            this.context.experimentalAliasEnabled = true;
        }
        if (realm_utils_1.utils.isPlainObject(opts.imports)) {
            for (let varName in opts.imports) {
                const pkgName = opts.imports[varName];
                HeaderImport_1.nativeModules.add(new HeaderImport_1.HeaderImport(varName, pkgName));
            }
        }
        if (opts.globals) {
            this.context.globals = opts.globals;
        }
        if (opts.shim) {
            this.context.shim = opts.shim;
        }
        if (opts.standaloneBundle !== undefined) {
            this.context.standaloneBundle = opts.standaloneBundle;
        }
        if (opts.sourceMap) {
            this.context.sourceMapConfig = opts.sourceMap;
        }
        if (opts.ignoreGlobal) {
            this.context.ignoreGlobal = opts.ignoreGlobal;
        }
        if (opts.outFile) {
            this.context.outFile = opts.outFile;
        }
        this.context.setHomeDir(homeDir);
        if (opts.cache !== undefined) {
            this.context.setUseCache(opts.cache);
        }
        this.virtualFiles = opts.files;
        this.context.initCache();
    }
    static init(opts) {
        return new FuseBox(opts);
    }
    triggerPre() {
        this.context.triggerPluginsMethodOnce("preBundle", [this.context]);
    }
    triggerStart() {
        this.context.triggerPluginsMethodOnce("bundleStart", [this.context]);
    }
    triggerEnd() {
        this.context.triggerPluginsMethodOnce("bundleEnd", [this.context]);
    }
    triggerPost() {
        this.context.triggerPluginsMethodOnce("postBundle", [this.context]);
    }
    bundle(str, bundleReady) {
        if (realm_utils_1.utils.isString(str)) {
            return this.initiateBundle(str, bundleReady);
        }
        if (realm_utils_1.utils.isPlainObject(str)) {
            let items = str;
            return realm_utils_1.each(items, (bundleStr, outFile) => {
                let newConfig = Object.assign({}, this.opts, { outFile: outFile });
                let fuse = FuseBox.init(newConfig);
                return fuse.initiateBundle(bundleStr);
            });
        }
    }
    devServer(str, opts) {
        let server = new Server_1.Server(this);
        return server.start(str, opts);
    }
    process(bundleData, bundleReady) {
        let bundleCollection = new ModuleCollection_1.ModuleCollection(this.context, this.context.defaultPackageName);
        bundleCollection.pm = new PathMaster_1.PathMaster(this.context, bundleData.homeDir);
        if (bundleData.typescriptMode) {
            this.context.tsMode = true;
            bundleCollection.pm.setTypeScriptMode();
        }
        let self = this;
        return bundleCollection.collectBundle(bundleData).then(module => {
            return realm_utils_1.chain(class extends realm_utils_1.Chainable {
                constructor() {
                    super(...arguments);
                    this.globalContents = [];
                }
                setDefaultCollection() {
                    return bundleCollection;
                }
                addDefaultContents() {
                    return self.collectionSource.get(this.defaultCollection).then((cnt) => {
                        self.context.log.echoDefaultCollection(this.defaultCollection, cnt);
                    });
                }
                addNodeModules() {
                    return realm_utils_1.each(self.context.nodeModules, (collection) => {
                        if (collection.cached || (collection.info && !collection.info.missing)) {
                            return self.collectionSource.get(collection).then((cnt) => {
                                self.context.log.echoCollection(collection, cnt);
                                if (!collection.cachedName && self.context.useCache) {
                                    self.context.cache.set(collection.info, cnt);
                                }
                                this.globalContents.push(cnt);
                            });
                        }
                    });
                }
                format() {
                    return {
                        contents: this.globalContents,
                    };
                }
            }).then(result => {
                self.context.log.end();
                this.triggerEnd();
                self.context.source.finalize(bundleData);
                this.triggerPost();
                this.context.writeOutput(bundleReady);
                return self.context.source.getResult();
            });
        });
    }
    addShims() {
        let shim = this.context.shim;
        if (shim) {
            for (let name in shim) {
                if (shim.hasOwnProperty(name)) {
                    let data = shim[name];
                    if (data.exports) {
                        let shimedCollection = ShimCollection_1.ShimCollection.create(this.context, name, data.exports);
                        this.context.addNodeModule(name, shimedCollection);
                        if (data.source) {
                            let source = Utils_1.ensureUserPath(data.source);
                            let contents = fs.readFileSync(source).toString();
                            this.context.source.addContent(contents);
                        }
                    }
                }
            }
        }
    }
    test(str = "**/*.test.ts", opts) {
        opts = opts || {};
        opts.reporter = opts.reporter || "fuse-test-reporter";
        opts.exit = true;
        const clonedOpts = Object.assign({}, this.opts);
        const testBundleFile = path.join(Config_1.Config.TEMP_FOLDER, "tests", decodeURIComponent(this.opts.outFile));
        clonedOpts.outFile = testBundleFile;
        str += ` +fuse-test ${opts.reporter} -ansi`;
        return FuseBox.init(clonedOpts).bundle(str, () => {
            const bundle = require(testBundleFile);
            let runner = new BundleTestRunner_1.BundleTestRunner(bundle, opts);
            return runner.start();
        });
    }
    initiateBundle(str, bundleReady) {
        this.context.reset();
        this.triggerPre();
        this.context.source.init();
        this.addShims();
        this.triggerStart();
        let parser = Arithmetic_1.Arithmetic.parse(str);
        let bundle;
        return Arithmetic_1.Arithmetic.getFiles(parser, this.virtualFiles, this.context.homeDir).then(data => {
            bundle = data;
            return this.process(data, bundleReady);
        }).then((contents) => {
            bundle.finalize();
            return contents;
        }).catch(e => {
            console.log(e.stack || e);
        });
    }
}
exports.FuseBox = FuseBox;
