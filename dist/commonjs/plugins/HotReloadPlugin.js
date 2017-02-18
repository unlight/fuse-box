"use strict";
class HotReloadPluginClass {
    constructor(opts = {}) {
        this.dependencies = ["fusebox-hot-reload"];
        this.port = "";
        if (opts.port) {
            this.port = opts.port;
        }
    }
    init() { }
    bundleEnd(context) {
        context.source.addContent(`FuseBox.import("fusebox-hot-reload").connect(${this.port})`);
    }
}
exports.HotReloadPluginClass = HotReloadPluginClass;
;
exports.HotReloadPlugin = (opts) => {
    return new HotReloadPluginClass(opts);
};
