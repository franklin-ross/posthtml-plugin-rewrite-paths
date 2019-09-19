# posthtml-rewrite-paths

*A [PostHTML](https://github.com/posthtml/posthtml) plugin for rewriting paths
in html attributes.*

Before:

```html
<script src="dist/index.js"></script>
```

After:

```html
<script src="dist/index.hash.js"></script>
```

## Install

```sh
npm install --save-dev https://github.com/franklin-ross/posthtml-plugin-rewrite-paths
```

## Usage

```javascript
const options = {
  // Map of tags and the attributes to check for paths. This is the
  // default if omitted.
  search: { "script": ["src"]},
  // Map of path names to replace or a path to a json file containing
  // the same. If a replacement value is nullish, the attribute is
  // removed.
  pathMap: { "dist/index.js": "index.hash.js" }
};

const html = `<body><script src="dist/index.js"></script></body>`;

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

Paths are matched textually with some minor normalisation of path separators.
Hence "src/a.js" will match "/src\a.js", but not "C:\project\src\s.js"; and
leading and trailing whitespace in the path pattern is ignored.

There is a special case when `pathMap` is loaded from file so that
`{ "path/to/replace.js": { "path": "replacement/path.js" } }` is also accepted.
This allows for simpler integration with tools that produce files in this
format.
