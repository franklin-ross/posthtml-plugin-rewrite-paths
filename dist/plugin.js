"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
/** Default value for the search option. */
const searchDefault = {
    "script": ["src"]
};
/** Converts a path string into a regular expression which matches that path with some looseness
 * around slashes and whitespace. */
function createPathRewriter(fromPath, toPath) {
    const normalisedPathString = fromPath
        // Remove any existing leading slash.
        .replace(/^[/\\]/, "")
        // Escape existing bracket regex chars. Actual character sets will be added soon, so brackets
        // in the original string need to be escaped first.
        .replace(/[\[\]]/g, "\\$&")
        // Convert slashes so they match either forward or backwards, unless they're escaping the
        // brackets in the previous step.
        .replace(/[/\\](?![\[\]])/g, "[/\\\\]")
        // Escape all other characters with special meaning in regular expressions.
        .replace(/[$^*+?.()|{}]/g, "\\$&");
    // Ignore leading/trailing whitespace, and allow either slash or no slash at the start.
    const regexStr = `^\\s*[/\\\\]?` + normalisedPathString + "\\s*$";
    const regex = new RegExp(regexStr);
    regex.replace = toPath ? toPath : false;
    return regex;
}
/** Build processor function from a path map. The processor takes a node and an attribute name, and
 * tests the attribute value against all of the paths in the path map. The first match either
 * replaces the attribute value, or removes the attribute. */
function buildProcessor(pathMap) {
    const rewriters = Object
        .keys(pathMap)
        .map(from => createPathRewriter(from, pathMap[from]));
    return function process(node, attrName) {
        if (node.attrs) {
            const attrValue = node.attrs[attrName];
            if (attrValue) {
                const rewriter = rewriters.find(function (r) { return r.test(this); }, attrValue);
                if (rewriter) {
                    if (rewriter.replace) {
                        node.attrs[attrName] = rewriter.replace;
                    }
                    else {
                        delete node.attrs[attrName];
                    }
                }
            }
        }
    };
}
/** Converts the path map in the options object into a usable object. */
function getPathMap(pathMap) {
    switch (typeof pathMap) {
        case "string":
            return new Promise(function (resolve, reject) {
                fs_1.readFile(pathMap, "utf8", function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const json = JSON.parse(data);
                        // If the value is { [key: string]: { path: string } } then remove the indirection.
                        // I forget which, but that's the shape of the output of one of the tools I was using.
                        for (var key in json) {
                            const value = json[key];
                            if (typeof value !== "string" && value && typeof value["path"] === "string") {
                                json[key] = json[key]["path"];
                            }
                        }
                        resolve(json);
                    }
                });
            });
        case "object":
            return Promise.resolve(pathMap);
        default:
            return Promise.reject("pathMap option must be a string or object");
    }
}
/** The rewrite-paths plugin for PostHTML. */
function rewritePathsPlugin(options) {
    const search = options.search || searchDefault;
    const processorFuture = getPathMap(options.pathMap).then(buildProcessor);
    return function (tree) {
        return processorFuture.then(processor => {
            tree.walk(node => {
                if (node.attrs && node.tag) {
                    const searchAttrs = search[node.tag];
                    if (searchAttrs) {
                        for (var attr of searchAttrs)
                            if (node.attrs[attr]) {
                                processor(node, attr);
                            }
                    }
                }
                return node;
            });
            return tree;
        });
    };
}
exports.default = rewritePathsPlugin;
;
