"use strict";
class BundleTestRunner {
    constructor(bundle, opts) {
        this.bundle = bundle;
        this.opts = opts || {};
        this.reporter = opts.reporter || "fuse-test-reporter";
        this.fuse = bundle.FuseBox;
    }
    start() {
        const FuseBoxTestRunner = this.fuse.import("fuse-test").FuseBoxTestRunner;
        const runner = new FuseBoxTestRunner(this.opts);
        runner.start();
    }
}
exports.BundleTestRunner = BundleTestRunner;
