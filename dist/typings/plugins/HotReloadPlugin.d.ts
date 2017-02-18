import { WorkFlowContext } from "./../WorkflowContext";
import { Plugin } from "../WorkflowContext";
export interface HotReloadPluginOptions {
    /** The port that the client JS connects to */
    port?: number | string;
}
/**
 * Hot reload plugin
 */
export declare class HotReloadPluginClass implements Plugin {
    dependencies: string[];
    port: any;
    constructor(opts?: HotReloadPluginOptions);
    init(): void;
    bundleEnd(context: WorkFlowContext): void;
}
export declare const HotReloadPlugin: (opts?: HotReloadPluginOptions) => HotReloadPluginClass;
