import { ModuleCollection } from "./ModuleCollection";
const ansi = require("ansi");
const cursor = ansi(process.stdout);
const prettysize = require("prettysize");
const prettyTime = require("pretty-time");

export class Log {
    private timeStart = process.hrtime();
    private totalSize = 0;
    constructor(public printLog: boolean) { }

    public echo(str: string) {
        let data = new Date();
        let hour: any = data.getHours();
        let min: any = data.getMinutes();
        let sec: any = data.getSeconds();

        hour = hour < 10 ? `0${hour}` : hour;
        min = min < 10 ? `0${min}` : min;
        sec = sec < 10 ? `0${sec}` : sec;

        cursor.yellow().write(`${hour}:${min}:${sec} : `)
            .green().write(str);
        cursor.write("\n");
        cursor.reset();
    }

    public echoStatus(str: string) {
        if (this.printLog) {
            cursor.write(`  → `)
                .cyan().write(str);
            cursor.write("\n");
            cursor.reset();
        }
    }

    public echoDefaultCollection(collection: ModuleCollection, contents: string) {
        if (!this.printLog) {
            return;
        }
        let bytes = Buffer.byteLength(contents, "utf8");
        let size = prettysize(bytes);
        this.totalSize += bytes;
        cursor.brightBlack().write(`└──`)
            .green().write(` ${collection.cachedName || collection.name}`)
            .yellow().write(` (${collection.dependencies.size} files,  ${size})`)

        cursor.write("\n")
        collection.dependencies.forEach(file => {
            if (!file.info.isRemoteFile) {
                cursor.brightBlack().write(`      ${file.info.fuseBoxPath}`).write("\n")
            }
        });
        cursor.reset();
    }

    public echoCollection(collection: ModuleCollection, contents: string) {
        if (!this.printLog) {
            return;
        }
        let bytes = Buffer.byteLength(contents, "utf8");
        let size = prettysize(bytes);
        this.totalSize += bytes;
        cursor.brightBlack().write(`└──`)
            .green().write(` ${collection.cachedName || collection.name}`)
            .brightBlack().write(` (${collection.dependencies.size} files)`)
            .yellow().write(` ${size}`)
            .write("\n").reset();
    }

    public end() {
        if (!this.printLog) {
            return;
        }
        let took = process.hrtime(this.timeStart)
        cursor.write("\n")
            .brightBlack().write(`    --------------\n`)
            .yellow().write(`    Size: ${prettysize(this.totalSize)} \n`)
            .yellow().write(`    Time: ${prettyTime(took, "ms")}`)
            .write("\n")
            .brightBlack().write(`    --------------\n`)
            .write("\n").reset();
    }
}