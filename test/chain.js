const should = require('should');
const build = require(`../dist/commonjs/index.js`);
const getTestEnv = require('./fixtures/lib').getTestEnv;
const SassPlugin = build.SassPlugin;
const RawPlugin = build.RawPlugin;
const FuseBox = build.FuseBox;

const testEnv = (config) => {
    let fsb = new FuseBox(Object.assign({
        homeDir: __dirname + '/fixtures/chain',
        log: false,
        cache: true,
        plugins: [build.JSONPlugin()],
    }, config || {}));
    return fsb;
}

describe('Chain', () => {
    
    it('Should be cached', (done) => {
        let testFile;
        let fsb = testEnv({
            plugins: [
                [
                    SassPlugin({}),
                    RawPlugin(),
                    {
                        transform: (file) => {
                            testFile = file;
                            return;
                        }
                    }
                ]
            ]
        });
        
        fsb.bundle('>style.scss')
            .then(data => {
                let scope = { navigator: 1 };
                let str = data.content.toString();
                str = str.replace(/\(this\)\);?$/, "(__root__))");
                let fn = new Function("window", "__root__", str);
                fn(scope, scope);
                return scope;
            })
            .then(root => {
                let result = root.FuseBox.import('./style.scss');
                should(result).be.ok();
                let cached = fsb.context.cache.getStaticCache(testFile);
                should(cached).be.ok();
                done();
            });
    });
    
});