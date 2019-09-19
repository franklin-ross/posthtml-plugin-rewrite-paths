# posthml-plugin-rewrite-paths

*A [PostHTML](https://github.com/posthtml/posthtml) plugin for rewriting paths in html attributes.*

## Install

```sh
npm install --save-dev https://github.com/franklin-ross/posthtml-plugin-rewrite-paths
```

## Programmatic usage

```javascript
const options = {
  // Map of tags and their attributes to check for paths. This is the default, and will
  // replace the src attribute value in <script src="path"></script> if "path" matches one of
  // the entries in pathMap.
  search: { "script": ["src"]},
  // Map of path names to replace or a path to a json file containing the same. If a replacement
  // value is null or undefined, the attribute is removed. Paths are matched textually with some
  // minor normalisation of path separators. Hence "src/a.js" will match "/src\a.js", but not
  // "C:\project\src\s.js".
  pathMap: { "index.js": "index.hash.js" }
};
const html = `<body><script src="index.js"></script></body>`;
posthtml([ plugin(options) ])
  .process(html)
  .then(result => {
    // write result.html;
  });
```

## Options

```typescript
{
  pathMap: "path-to-json-file.json" | { "path/to/replace.js": "replacement/path.js" };
  search: { "tag-name": ["attribute-to-check", "attribute-to-check", ...]}
}
```
