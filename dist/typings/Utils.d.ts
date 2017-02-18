export declare function camelCase(str: string): string;
export declare function parseQuery(qstr: any): Map<string, string>;
/**
 * Does two things:
 * - If a relative path is given,
 *  it is assumed to be relative to appRoot and is then made absolute
 * - Ensures that the directory containing the userPath exits (creates it if needed)
 */
export declare function ensureUserPath(userPath: string): string;
export declare function ensureDir(userPath: string): string;
export declare function replaceExt(npath: any, ext: any): string;
export declare function ensurePublicExtension(url: string): string;
export declare function getBuiltInNodeModules(): Array<string>;
export declare function findFileBackwards(target: string, limitPath: string): string;
