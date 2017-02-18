/// <reference types="node" />
import { BundleData } from './Arithmetic';
import { ModuleCollection } from "./ModuleCollection";
import { WorkFlowContext } from "./WorkflowContext";
import { File } from "./File";
export declare type Concat = {
    add(fileName: string | null, content: string | Buffer, sourceMap?: string): void;
    content: Buffer;
    sourceMap: string;
};
export declare type ConcatModule = {
    new (generateSourceMap: boolean, outputFileName: string, seperator: string): Concat;
};
export declare const Concat: ConcatModule;
/**
 *
 *
 * @export
 * @class BundleSource
 */
export declare class BundleSource {
    context: WorkFlowContext;
    /**
     *
     *
     *
     * @memberOf BundleSource
     */
    standalone: boolean;
    /**
     *
     *
     * @private
     * @type {*}
     * @memberOf BundleSource
     */
    private concat;
    private collectionSource;
    /**
     * Creates an instance of BundleSource.
     *
     * @param {WorkFlowContext} context
     *
     * @memberOf BundleSource
     */
    constructor(context: WorkFlowContext);
    /**
     *
     *
     * @memberOf BundleSource
     */
    init(): void;
    /**
     *
     *
     * @param {ModuleCollection} collection
     *
     * @memberOf BundleSource
     */
    createCollection(collection: ModuleCollection): void;
    addContentToCurrentCollection(data: string): void;
    startCollection(collection: ModuleCollection): void;
    /**
     *
     *
     * @param {ModuleCollection} collection
     *
     * @memberOf BundleSource
     */
    endCollection(collection: ModuleCollection): any;
    /**
     *
     *
     * @param {string} data
     *
     * @memberOf BundleSource
     */
    addContent(data: string): void;
    /**
     *
     *
     * @param {File} file
     *
     * @memberOf BundleSource
     */
    addFile(file: File): void;
    /**
     *
     *
     * @param {BundleData} bundleData
     *
     * @memberOf BundleSource
     */
    finalize(bundleData: BundleData): void;
    /**
     *
     *
     * @returns
     *
     * @memberOf BundleSource
     */
    getResult(): Concat;
}