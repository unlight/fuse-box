import { Server, ServerOptions } from "./devServer/Server";
import { WorkFlowContext, Plugin } from "./WorkflowContext";
import { CollectionSource } from "./CollectionSource";
import { BundleData } from "./Arithmetic";
import { ModuleCollection } from "./ModuleCollection";
export interface FuseBoxOptions {
    homeDir?: string;
    modulesFolder?: string;
    tsConfig?: string;
    package?: string;
    cache?: boolean;
    log?: boolean;
    globals?: {
        [packageName: string]: string;
    };
    plugins?: Plugin[];
    imports?: any;
    shim?: any;
    standaloneBundle?: boolean;
    sourceMap?: any;
    ignoreGlobal?: string[];
    serverBundle?: boolean;
    outFile?: string;
    debug?: boolean;
    files?: any;
    alias?: any;
    transformTypescript?: (contents: string) => string;
}
/**
 *
 *
 * @export
 * @class FuseBox
 */
export declare class FuseBox {
    opts: FuseBoxOptions;
    static init(opts?: FuseBoxOptions): FuseBox;
    virtualFiles: any;
    collectionSource: CollectionSource;
    context: WorkFlowContext;
    /**
     * Creates an instance of FuseBox.
     *
     * @param {*} opts
     *
     * @memberOf FuseBox
     */
    constructor(opts?: FuseBoxOptions);
    triggerPre(): void;
    triggerStart(): void;
    triggerEnd(): void;
    triggerPost(): void;
    /**
     * Make a Bundle (or bundles)
     */
    bundle(str: string | {
        [bundleStr: string]: string;
    }, bundleReady?: any): Promise<any>;
    /** Starts the dev server and returns it */
    devServer(str: string, opts?: ServerOptions): Server;
    process(bundleData: BundleData, bundleReady?: () => any): Promise<ModuleCollection>;
    addShims(): void;
    test(str: string, opts: any): Promise<any>;
    initiateBundle(str: string, bundleReady?: any): Promise<any>;
}
