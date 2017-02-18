import { FuseBox } from '../';
import * as express from "express";
export interface HTTPServerOptions {
    /** Defaults to 4444 if not specified */
    port?: number;
    /**
     * If specfied this is the folder served from express.static
     * It can be an absolute path or relative to `appRootPath`
     **/
    root?: string | boolean;
}
export declare class HTTPServer {
    private fuse;
    static start(opts: any, fuse: FuseBox): HTTPServer;
    app: express.Application;
    opts: HTTPServerOptions;
    constructor(fuse: FuseBox);
    launch(opts: HTTPServerOptions): void;
    serveStatic(userPath: any, userFolder: any): void;
    private setup();
}
