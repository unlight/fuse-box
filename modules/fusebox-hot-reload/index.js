"use strict";
var Client = require("fusebox-websocket").SocketClient;
exports.connect = function (port) {
    if (FuseBox.isServer) {
        return;
    }
    port = port || window.location.port;
    var client = new Client({
        port: port
    });
    client.connect();
    console.log("connecting...");
    client.on("source-changed", function (data) {
        console.log("Updating \"" + data.path + "\" ...");
        for (var index = 0; index < FuseBox.plugins.length; index++) {
            var plugin = FuseBox.plugins[index];
            if (plugin.hmrUpdate && plugin.hmrUpdate(data)) {
                return;
            }
        }
        if (data.type === "js") {
            FuseBox.flush();
            FuseBox.dynamic(data.path, data.content);
            if (FuseBox.mainFile) {
                FuseBox.import(FuseBox.mainFile);
            }
        }
        if (data.type === "css" && __fsbx_css) {
            var sPath = JSON.stringify(data.path);
            var sContent = JSON.stringify(data.content);
            var newContent = "(" + __fsbx_css.toString() + ")(" + sPath + ", " + sContent + ")";
            FuseBox.dynamic(data.path, newContent);
            __fsbx_css(data.path, data.content);
        }
    });
    client.on("error", function (error) {
        console.log(error);
    });
};
