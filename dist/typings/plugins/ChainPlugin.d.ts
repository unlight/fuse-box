import { WorkFlowContext, Plugin } from '../WorkflowContext';
import { File } from '../File';
export declare class ChainPluginClass {
    private test;
    private plugins;
    constructor(test: RegExp, plugins: Array<Plugin>);
    add(plugin: Plugin): this;
    bundleStart(context: WorkFlowContext): void;
    transform(file: File): Promise<void>;
    bundleEnd(context: WorkFlowContext): void;
}
export declare const ChainPlugin: (test: RegExp, plugins: Plugin[]) => ChainPluginClass;
