# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2019-09-19

### Added

- Add [pinkhominid](https://github.com/pinkhominid) as contributor in
  package.json.

## [1.0.0] - 2019-09-19

### Added

- Published as npm package `posthtml-rewrite-paths`.
- TypeScript definition file.
- More tests for special character handling, slash agnosticism, and multiple
  attribute handling.

### Changed

- Large refactor, but should be no functional changes.
- Main plugin file is now minified, but unminified JS is also available.

## [0.2.0] - 2019-08-25

### Fixed

- [pinkhominid](https://github.com/pinkhominid) fixed a bug where only the first
  slash was being normalised.
- [pinkhominid](https://github.com/pinkhominid) fixed a bug where square
  brackets were being double escaped.

## [0.1.0] - 2017-04-27

### Added

- Initial version published to Github.
