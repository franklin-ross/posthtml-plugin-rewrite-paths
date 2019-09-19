import plugin from "..";
import "mocha";
import { expect } from "chai";

// This little dance seems necessary to get around the bad types in the PostHTML package. The types
// seem to say PostHTML is a default export, but in reality it's an old `exports = posthtml`.
import PostHTML from "posthtml";
import * as _posthtml from "posthtml";
const posthtml = _posthtml as unknown as typeof PostHTML;

describe("posthtml-plugin-rewrite-paths", function() {
  it("should export default a function", function() {
    expect(plugin).to.be.a("function");
  });

  it("should return a function when called", function() {
    expect(plugin({ pathMap: {}})).to.be.a("function");
  });

  it("should remap script file", function() {
    const options = {
      search: { "script": ["src"]},
      pathMap: { "index.js": "index.hash.js" }
    };
    const html = `<body><script src="index.js"></script></body>`;
    return posthtml([ plugin(options) ])
      .process(html)
      .then(result => {
        expect(result.html).to.equal(`<body><script src="index.hash.js"></script></body>`);
      });
  });

  it("should remap script file path with slashes", function() {
    const options = {
      search: { "script": ["src"]},
      pathMap: { "src/js/index.js": "dist/index.hash.js" }
    };
    const html = `<body><script src="src/js/index.js"></script></body>`;
    return posthtml([ plugin(options) ])
      .process(html)
      .then(result => {
        expect(result.html).to.equal(`<body><script src="dist/index.hash.js"></script></body>`);
      });
  });

  describe("should replace all matching attributes", function() {
    const options = {
      search: { "t": ["a", "b", "c"]},
      pathMap: { "abc": "xyz" }
    };
    const html = `<t a="abc" b="abc" c="abc" d="abc"></t>`;
    return posthtml([ plugin(options) ])
      .process(html)
      .then(result => {
        expect(result.html).to.equal(`<t a="xyz" b="xyz" c="xyz" d="abc"></t>`);
      });
  });

  describe("should be slash agnostic", function() {
    const from = "a\\b/c";
    const options = {
      search: { "t": ["a"]},
      pathMap: { [from]: "xyz" }
    };
    ["a/b/c", "/a/b/c", "a\\b\\c", "\\a\\b\\c"].forEach(function(check: string) {
      it(`"${from}" should match "${check}"`, function () {
        return posthtml([ plugin(options) ])
          .process(`<t a="${check}"></t>`)
          .then(result => {
            expect(result.html).to.equal(`<t a="xyz"></t>`);
          });
      });
    });
  });

  describe("should remap script file path with special character", function() {
    Array.from("$^*+?.()|{}\[\]").forEach(function(character: string) {
      it(`allows ${character} in path`, function() {
        // It's important that a preceding \ doesn't count as an escape character here.
        const pathMatch = `src\\${character}js/index.js`;
        const pathReplace = "dist/index.hash.js";
        const options = {
          search: { "script": ["src"]},
          pathMap: { [pathMatch]: pathReplace }
        };
        const html = `<body><script src="${pathMatch}"></script></body>`;
        return posthtml([ plugin(options) ])
          .process(html)
          .then(result => {
            expect(result.html).to.equal(`<body><script src="${pathReplace}"></script></body>`);
          });
      });
    });
  });

  it("should remap script file path with parens", function() {
    const options = {
      search: { "script": ["src"]},
      pathMap: { "src/(m)js/index.js": "dist/index.hash.js" }
    };
    const html = `<body><script src="src/(m)js/index.js"></script></body>`;
    return posthtml([ plugin(options) ])
      .process(html)
      .then(result => {
        expect(result.html).to.equal(`<body><script src="dist/index.hash.js"></script></body>`);
      });
  });

  it(`options.search should default to { "script": ["src"] }`, function() {
    const options = {
      pathMap: { "index.js": "index.hash.js" }
    };
    const html = `<body><script src="index.js"></script></body>`;
    return posthtml([ plugin(options) ])
      .process(html)
      .then(result => {
        expect(result.html).to.equal(`<body><script src="index.hash.js"></script></body>`);
      });
  });

  it("should load options.pathMap from file", function () {
    const options = {
      pathMap: "test/test-path-map.json"
    };
    const html = `<script src="a.js"></script><script src="b.js"></script>`;
    return posthtml([ plugin(options) ])
      .process(html)
      .then(result => {
        expect(result.html).to.equal(`<script src="a.hash.js"></script><script src="b.hash.js"></script>`);
      });
  });

  it("should leave unmapped tags alone", () => {
    const options = {
      search: { "script": ["src"] },
      pathMap: { "index.js": "index.hash.js" }
    };
    const html = `<div><span src="index.js"></span></div>`;
    return posthtml([ plugin(options) ])
      .process(html)
      .then(result => {
        expect(result.html).to.equal(html);
      });
  });
});
