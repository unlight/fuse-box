import { ModuleCollection } from "./ModuleCollection";
export declare class Log {
    printLog: boolean;
    private timeStart;
    private totalSize;
    constructor(printLog: boolean);
    echo(str: string): void;
    echoStatus(str: string): void;
    echoDefaultCollection(collection: ModuleCollection, contents: string): void;
    echoCollection(collection: ModuleCollection, contents: string): void;
    end(header?: string): void;
    echoBundleStats(header: string, size: number, took: [number, number]): void;
}
