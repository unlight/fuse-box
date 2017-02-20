const should = require("should");

const { getTestEnv, createEnv } = require("./fixtures/lib.js")
describe("Native variables", (done) => {

    it("`Should inject a variable woops case 1`", (done) => {

        createEnv({
            modules: {
                superFoo: {
                    files: {
                        "index.ts": `export const HelloFoo = "I am super"`
                    },
                    package: "superFoo",
                    instructions: ">index.ts"
                }
            },
            project: {
                imports: {
                    woops: "superFoo"
                },
                files: {
                    "index.ts": `exports.something = woops`
                },
                instructions: "> index.ts"
            }
        }).then((result) => {
            const out = result.project.FuseBox.import("./index");
            const contents = result.projectContents.toString();
            should.equal(
                contents.indexOf(`/* fuse:injection: */ var woops`) > -1, true);
            out.should.deepEqual({ something: { HelloFoo: 'I am super' } })
            done();
        })
    })



    it("`Should inject a variable woops case 2`", (done) => {

        createEnv({
            modules: {
                superFoo: {
                    files: {
                        "index.ts": `export const HelloFoo = {someAction : () => "here"}`
                    },
                    package: "superFoo",
                    instructions: ">index.ts"
                }
            },
            project: {
                imports: {
                    woops: "superFoo"
                },
                files: {
                    "index.ts": `exports.something = woops.HelloFoo.someAction()`
                },
                instructions: "> index.ts"
            }
        }).then((result) => {
            const out = result.project.FuseBox.import("./index");
            const contents = result.projectContents.toString();
            should.equal(
                contents.indexOf(`/* fuse:injection: */ var woops`) > -1, true);
            out.should.deepEqual({ something: "here" })
            done();
        })
    })


    it("`Should inject a variable woops case 2`", (done) => {

        createEnv({
            modules: {
                superFoo: {
                    files: {
                        "index.ts": `export const HelloFoo = "I am super"`
                    },
                    package: "superFoo",
                    instructions: ">index.ts"
                }
            },
            project: {
                imports: {
                    woops: "superFoo"
                },
                files: {
                    "index.ts": `
                        var coo = woops;
                        exports.something = coo;
                    `
                },
                instructions: "> index.ts"
            }
        }).then((result) => {
            const out = result.project.FuseBox.import("./index");
            const contents = result.projectContents.toString();

            should.equal(
                contents.indexOf(`/* fuse:injection: */ var woops`) > -1, true);
            out.should.deepEqual({ something: { HelloFoo: 'I am super' } })
            done();
        })
    })

    it("`Should not inject a variable woops case 1`", (done) => {

        createEnv({
            modules: {
                superFoo2: {
                    files: {
                        "index.ts": `export const HelloFoo = "I am super"`
                    },
                    package: "superFoo2",
                    instructions: ">index.ts"
                }
            },
            project: {
                imports: {
                    woops: "superFoo2"
                },
                files: {
                    "index.ts": `

                        var woops = {nada : true}
                        exports.myExport = woops;
                    `
                },
                instructions: "> index.ts"
            }
        }).then((result) => {
            const out = result.project.FuseBox.import("./index");
            const contents = result.projectContents.toString();

            should.equal(
                contents.indexOf(`/* fuse:injection: */ var woops`) === -1, true);
            out.should.deepEqual({ myExport: { nada: true } })
            done();
        }).catch(done)
    })


    it("`Should inject a variable Inferno`", (done) => {

        createEnv({
            modules: {
                inferno: {
                    files: {
                        "index.ts": `
                            export function magic(){
                                return "pure magic"
                            }
                        `
                    },
                    package: "Inferno",
                    instructions: ">index.ts"
                }
            },
            project: {
                imports: {
                    Inferno: "inferno"
                },
                files: {
                    "index.ts": `exports.result = Inferno.magic()`
                },
                instructions: "> index.ts"
            }
        }).then((result) => {
            const out = result.project.FuseBox.import("./index");
            const contents = result.projectContents.toString();
            should.equal(
                contents.indexOf(`/* fuse:injection: */ var Inferno`) > -1, true);
            out.should.deepEqual({ result: "pure magic" })
            done();
        })
    })
})