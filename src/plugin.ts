declare namespace posthtml {
  class Tree {
    walk(processNode: (node: Node) => void): void;
  }

  class Node {
    tag: string;
    attrs: Map<string>;
  }
}

interface IOptions {
  pathMap?: string | Map<string>;
  search?: Map<string[]>
}

type Map<T> = { [key: string]: T };

class AttributeTransform {
  private _replacers: (RegExp & { replace?: string })[] = [];

  process(node: posthtml.Node, attrName: string) {
    const attrValue = node.attrs[attrName];
    const matcher = this._replacers.find(match => match.test(attrValue));
    if (matcher) {
      if (matcher.replace == null) {
        delete node.attrs[attrName];
      } else {
        node.attrs[attrName] = matcher.replace;
      }
    }
    return node;
  }

  addPathReplacer(from: string, to: string) {
    const regex = <RegExp & { replace?: string }>this.createPathRegex(from);
    regex.replace = to;
    this._replacers.push(regex);
  }

  addPathRemover(path: string) {
    return this.createPathRegex(path);
  }

  private createPathRegex(pathString: string): RegExp {
    const regexStr =
      "^\\s*[/\\\\]?" + //Match either slash at the start.
      pathString
        .replace(/^[/\\]?/, "") //Remove any existing leading slash.
        .replace(/[/\\]/g, "[/\\\\]") //Match either slash inside target.
        .replace(/([$^*+?.()|{}])/, "\\$1") + //Escape non-slash regex chars.
      "\\s*$";
    return new RegExp(regexStr);
  }
}

class Remapper {
  _search: Map<string[]> = {
    "script": ["src"]
  };
  _processor: Promise<AttributeTransform>;
  constructor(options: IOptions) {
    if (options.search) {
      this._search = options.search;
    }
    this._processor = this._getPathMap(options.pathMap)
      .then(context => {
        const processor = new AttributeTransform();
        for (var path of Object.keys(context)) {
          processor.addPathReplacer(path, context[path]);
        }
        return processor;
      });
  }

  _getPathMap(pathMap): Promise<Map<string>> {
    const type = typeof pathMap;
    if (type === "string") {
      const fs = require("fs");
      return new Promise<Map<string>>(function (resolve, reject) {
        fs.readFile(pathMap, function (err, data) {
          if (err) {
            reject(err);
          } else {
            const json = JSON.parse(data);
            //If the value is { [key: string]: { path: string } } then remove the indirection.
            for (var key in json) {
              const value = json[key];
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
  }

  remapTree(tree: posthtml.Tree) {
    return this._processor.then(processor => {
      tree.walk(node => {
        if (node.attrs) {
          const searchAttrs = this._search[node.tag];
          if (searchAttrs) {
            for (var attr of searchAttrs) if (node.attrs[attr]) {
              return processor.process(node, attr);
            }
          }
        }
        return node;
      });
      return tree;
    });
  }
}

export default function remapPaths(options: IOptions) {
  const remapper = new Remapper(options);
  return remapper.remapTree.bind(remapper);
};
