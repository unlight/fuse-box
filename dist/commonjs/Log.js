"use strict";
const ansi = require("ansi");
const cursor = ansi(process.stdout);
const prettysize = require("prettysize");
const prettyTime = require("pretty-time");
class Log {
    constructor(printLog) {
        this.printLog = printLog;
        this.timeStart = process.hrtime();
        this.totalSize = 0;
    }
    echo(str) {
        let data = new Date();
        let hour = data.getHours();
        let min = data.getMinutes();
        let sec = data.getSeconds();
        hour = hour < 10 ? `0${hour}` : hour;
        min = min < 10 ? `0${min}` : min;
        sec = sec < 10 ? `0${sec}` : sec;
        cursor.yellow().write(`${hour}:${min}:${sec} : `)
            .green().write(str);
        cursor.write("\n");
        cursor.reset();
    }
    echoStatus(str) {
        if (this.printLog) {
            cursor.write(`  → `)
                .cyan().write(str);
            cursor.write("\n");
            cursor.reset();
        }
    }
    echoDefaultCollection(collection, contents) {
        if (!this.printLog) {
            return;
        }
        let bytes = Buffer.byteLength(contents, "utf8");
        let size = prettysize(bytes);
        this.totalSize += bytes;
        cursor.reset().write(`└──`)
            .green().write(` ${collection.cachedName || collection.name}`)
            .yellow().write(` (${collection.dependencies.size} files,  ${size})`);
        cursor.write("\n");
        collection.dependencies.forEach(file => {
            if (!file.info.isRemoteFile) {
                cursor.reset().write(`      ${file.info.fuseBoxPath}`).write("\n");
            }
        });
        cursor.reset();
    }
    echoCollection(collection, contents) {
        if (!this.printLog) {
            return;
        }
        let bytes = Buffer.byteLength(contents, "utf8");
        let size = prettysize(bytes);
        this.totalSize += bytes;
        cursor.reset().write(`└──`)
            .green().write(` ${collection.cachedName || collection.name}`)
            .reset().write(` (${collection.dependencies.size} files)`)
            .yellow().write(` ${size}`)
            .write("\n").reset();
    }
    end(header) {
        let took = process.hrtime(this.timeStart);
        this.echoBundleStats(header || 'Bundle', this.totalSize, took);
    }
    echoBundleStats(header, size, took) {
        if (!this.printLog) {
            return;
        }
        cursor.write("\n")
            .green().write(`    ${header}\n`)
            .yellow().write(`    Size: ${prettysize(size)} \n`)
            .yellow().write(`    Time: ${prettyTime(took, "ms")}`)
            .write("\n").reset();
    }
}
exports.Log = Log;
