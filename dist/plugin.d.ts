import { PostHTML } from "posthtml";
/** The options object for the rewrite-paths plugin. */
export interface IOptions {
    /** Map of tags and attributes to process.
     * @default { "script": ["src"]} */
    search?: SearchMap;
    /** Map of path names to replace or a path to a json file containing the same. If a replacement
     * value is null or undefined, the attribute is removed. Paths are matched textually with some
     * minor normalisation of path separators. Hence "src/a.js" will match "/src\a.js", but not
     * "C:\project\src\s.js".
     * @example { "dist/index.js": "dist/index.hash.js" } */
    pathMap: string | PathMap;
}
/** Map of tags and attributes to process. */
export declare type SearchMap = {
    [tagName: string]: string[];
};
/** Map of path names to replace. */
export declare type PathMap = {
    [fromPath: string]: string;
};
/** The rewrite-paths plugin for PostHTML. */
export default function rewritePathsPlugin(options: IOptions): (tree: PostHTML.NodeAPI) => Promise<PostHTML.NodeAPI>;
