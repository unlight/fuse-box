"use strict";
const appRoot = require("app-root-path");
const path = require("path");
const PROJECT_ROOT = path.join(__dirname, "../../");
class Configuration {
    constructor() {
        this.NODE_MODULES_DIR = process.env.PROJECT_NODE_MODULES || path.join(appRoot.path, "node_modules");
        this.FUSEBOX_MODULES = path.join(PROJECT_ROOT, "modules");
        this.TEMP_FOLDER = path.join(appRoot.path, ".fusebox");
        this.PROJECT_FOLDER = appRoot.path;
        this.FUSEBOX_VERSION = require(path.join(PROJECT_ROOT, "package.json")).version;
    }
}
exports.Configuration = Configuration;
exports.Config = new Configuration();