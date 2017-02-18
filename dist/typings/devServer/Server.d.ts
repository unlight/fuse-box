import { SocketServer } from "./SocketServer";
import { HTTPServer } from "./HTTPServer";
import { FuseBox } from "../FuseBox";
export declare type HotReloadEmitter = (server: Server, sourceChangedInfo: any) => any;
export declare type SourceChangedEvent = {
    type: 'js' | 'css';
    content: string;
    path: string;
};
export interface ServerOptions {
    /** Defaults to 4444 if not specified */
    port?: number;
    /**
     * - If false nothing is served.
     * - If string specfied this is the folder served from express.static
     * - It can be an absolute path or relative to `appRootPath`
     **/
    root?: boolean | string;
    emitter?: HotReloadEmitter;
    httpServer?: boolean;
}
/**
 * Wrapper around the static + socket servers
 */
export declare class Server {
    private fuse;
    httpServer: HTTPServer;
    socketServer: SocketServer;
    constructor(fuse: FuseBox);
    /**
     * Starts the server
     * @param str the default bundle arithmetic string
     */
    start(str: string, opts?: ServerOptions): Server;
}
