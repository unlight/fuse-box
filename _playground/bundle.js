const fs = require("fs");
const watch = require("watch");

const build = require("./../build/commonjs/index.js");
const FuseBox = build.FuseBox;


const fuseBox = FuseBox.init({
    homeDir: "_playground/ts",
    // sourceMap: {
    //     bundleReference: "./sourcemaps.js.map",
    //     outFile: "_playground/_build/sourcemaps.js.map",
    // },
    //globals: { jQuery: "$" },
    cache: true,
    //globals: { default: "myLib", "wires-reactive": "Reactive" },
    outFile: "_playground/_build/out.js",
    //package: "myLib",
    //globals: { myLib: "myLib" },
    modulesFolder: "_playground/npm",
    shim: {
        jquery: {
            exports: "$"
        }
    },

    cache: false,
    log: true,
    plugins: [
        build.TypeScriptHelpers(),
        build.JSONPlugin(),
        build.EnvPlugin({ foo: "bar" }),
        build.ImageBase64Plugin(),

        [/node_modules.*\.css$/, build.CSSResourcePlugin({
            dist: "_playground/_build/resources",
            resolve: (f) => `resources/${f}`
        }), build.CSSPlugin()],


        [build.CSSResourcePlugin({ inline: true }), build.CSSPlugin()],
        // [/\.txt$/, build.ConcatPlugin({ ext: ".txt", name: "textBundle.txt" })],

        // // process them all ;-)
        // [build.LESSPlugin(), build.CSSPlugin()],

        // [build.SassPlugin(), build.CSSPlugin()],

        // // All other CSS files
        // [build.PostCSS(POST_CSS_PLUGINS), build.CSSPlugin()],

        // // Add a banner to bundle output
        // build.BannerPlugin('// Hey this is my banner! Copyright 2016!'),


        //build.UglifyJSPlugin()

        build.HTMLPlugin(),
    ]
});

/*const devServer = fuseBox.devServer(">index.ts", {
    port: 8083,
    emitter: (self, fileInfo) => {
        self.socketServer.send("source-changed", fileInfo);
    }
});*/
// fuseBox.devServer(">index.ts", {
//     port: 7777
// })

fuseBox.devServer(">index.ts", {
    port: 7778
})