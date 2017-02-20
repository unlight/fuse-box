"use strict";
class HeaderImport {
    constructor(variable, pkg) {
        this.variable = variable;
        this.pkg = pkg;
    }
}
exports.HeaderImport = HeaderImport;
class HeaderImportCollection {
    constructor() {
        this.collection = new Map();
    }
    add(config) {
        this.collection.set(config.variable, config);
    }
    get(variable) {
        return this.collection.get(variable);
    }
    has(variable) {
        return this.collection.get(variable) !== undefined;
    }
}
exports.HeaderImportCollection = HeaderImportCollection;
let headerCollection;
if (!headerCollection) {
    headerCollection = new HeaderImportCollection();
    ;
}
headerCollection.add(new HeaderImport("process", "process"));
headerCollection.add(new HeaderImport("Buffer", "buffer"));
headerCollection.add(new HeaderImport("http", "http"));
exports.nativeModules = headerCollection;
