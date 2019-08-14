import plugin from "../src/plugin";
import * as path from "path";
import "mocha";
import { expect } from "chai";
import * as posthtml from 'posthtml'

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
