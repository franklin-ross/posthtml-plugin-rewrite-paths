"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = remapPaths;
var AttributeTransform = /** @class */function () {
    function AttributeTransform() {
        this._replacers = [];
    }
    AttributeTransform.prototype.process = function (node, attrName) {
        var attrValue = node.attrs[attrName];
        var matcher = this._replacers.find(function (match) {
            return match.test(attrValue);
        });
        if (matcher) {
            if (matcher.replace == null) {
                delete node.attrs[attrName];
            } else {
                node.attrs[attrName] = matcher.replace;
            }
        }
        return node;
    };
    AttributeTransform.prototype.addPathReplacer = function (from, to) {
        var regex = this.createPathRegex(from);
        regex.replace = to;
        this._replacers.push(regex);
    };
    AttributeTransform.prototype.addPathRemover = function (path) {
        return this.createPathRegex(path);
    };
    AttributeTransform.prototype.createPathRegex = function (pathString) {
        var regexStr = "^\\s*[/\\\\]?" + //Match either slash at the start.
        pathString.replace(/^[/\\]?/, "") //Remove any existing leading slash.
        .replace(/([\[\]])/g, "\\$1") //Escape bracket regex chars.
        //Match either slash inside target (not followed by bracket).
        .replace(/[/\\](?![\[\]])/g, "[/\\\\]").replace(/([$^*+?.()|{}])/g, "\\$1") + //Escape non-slash, non-bracket regex chars.
        "\\s*$";
        return new RegExp(regexStr);
    };
    return AttributeTransform;
}();
var Remapper = /** @class */function () {
    function Remapper(options) {
        this._search = {
            "script": ["src"]
        };
        if (options.search) {
            this._search = options.search;
        }
        this._processor = this._getPathMap(options.pathMap).then(function (context) {
            var processor = new AttributeTransform();
            for (var _i = 0, _a = Object.keys(context); _i < _a.length; _i++) {
                var path = _a[_i];
                processor.addPathReplacer(path, context[path]);
            }
            return processor;
        });
    }
    Remapper.prototype._getPathMap = function (pathMap) {
        var type = typeof pathMap;
        if (type === "string") {
            var fs_1 = require("fs");
            return new Promise(function (resolve, reject) {
                fs_1.readFile(pathMap, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        var json = JSON.parse(data);
                        //If the value is { [key: string]: { path: string } } then remove the indirection.
                        for (var key in json) {
                            var value = json[key];
                            if (value != null && typeof value !== "string" && typeof value["path"] === "string") {
                                json[key] = json[key]["path"];
                            }
                        }
                        resolve(json);
                    }
                });
            });
        } else if (type === "object") {
            return Promise.resolve(pathMap);
        } else {
            return Promise.reject("pathMap option must be a string or object");
        }
    };
    Remapper.prototype.remapTree = function (tree) {
        var _this = this;
        return this._processor.then(function (processor) {
            tree.walk(function (node) {
                if (node.attrs) {
                    var searchAttrs = _this._search[node.tag];
                    if (searchAttrs) {
                        for (var _i = 0, searchAttrs_1 = searchAttrs; _i < searchAttrs_1.length; _i++) {
                            var attr = searchAttrs_1[_i];
                            if (node.attrs[attr]) {
                                return processor.process(node, attr);
                            }
                        }
                    }
                }
                return node;
            });
            return tree;
        });
    };
    return Remapper;
}();
function remapPaths(options) {
    var remapper = new Remapper(options);
    return remapper.remapTree.bind(remapper);
}
;
//# sourceMappingURL=plugin.js.map
