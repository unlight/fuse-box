"use strict";
const File_1 = require("./File");
const ModuleCollection_1 = require("./ModuleCollection");
class ShimCollection {
    static create(context, name, exports) {
        let entryInfo = {
            isNodeModule: false,
            fuseBoxPath: "index.js"
        };
        let entryFile = new File_1.File(context, entryInfo);
        entryFile.isLoaded = true;
        entryFile.analysis.skip();
        entryFile.contents = `module.exports = ${exports}`;
        let collection = new ModuleCollection_1.ModuleCollection(context, name, {
            missing: false,
        });
        collection.dependencies.set(name, entryFile);
        collection.setupEntry(entryFile);
        return collection;
    }
}
exports.ShimCollection = ShimCollection;