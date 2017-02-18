"use strict";
const realm_utils_1 = require("realm-utils");
class ChainPluginClass {
    constructor(test, plugins) {
        this.test = test;
        this.plugins = plugins;
    }
    add(plugin) {
        this.plugins.push(plugin);
        return this;
    }
    bundleStart(context) {
        let plugin = this.plugins.find(plugin => realm_utils_1.utils.isFunction(plugin.bundleStart));
        if (plugin) {
            plugin.bundleStart(context);
        }
    }
    transform(file) {
        let context = file.context;
        if (context.useCache) {
            let cached = context.cache.getStaticCache(file);
            if (cached) {
                file.isLoaded = true;
                file.contents = cached.contents;
                return;
            }
        }
        return realm_utils_1.each(this.plugins, (plugin) => {
            if (realm_utils_1.utils.isFunction(plugin.initialize)) {
                return plugin.initialize.apply(plugin, [context]);
            }
            if (realm_utils_1.utils.isFunction(plugin.transform)) {
                return plugin.transform.apply(plugin, [file]);
            }
        }).then(() => {
            if (context.useCache) {
                context.sourceChangedEmitter.emit({
                    type: null,
                    content: file.contents,
                    path: file.info.fuseBoxPath,
                });
                context.cache.writeStaticCache(file, file.sourceMap);
            }
        });
    }
    bundleEnd(context) {
        let plugin = this.plugins.find(plugin => realm_utils_1.utils.isFunction(plugin.bundleEnd));
        if (plugin) {
            plugin.bundleEnd(context);
        }
    }
}
exports.ChainPluginClass = ChainPluginClass;
exports.ChainPlugin = (test, plugins) => {
    return new ChainPluginClass(test, plugins);
};
