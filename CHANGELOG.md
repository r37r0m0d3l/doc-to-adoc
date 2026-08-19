# 📝 Changelog

## [1.1.1]

### Added

- ➕ `llms.txt`

- ➕ `llms-full.txt`

## [1.1.0]

### Added

- ➕ Extended format coverage across documents, markup, structured data, and images (including *OCR* for images and scanned *PDFs*).

- 🔨 Expanded CLI/NPM test coverage for *.DOC*, *OCR*, and multi-format conversion flows.

### Updates

- ♻️ Refactored the converter into modular format-specific utilities and exported them from the package entrypoint.

- 🧩 Improved CLI behavior with dynamic version reporting and safer async stdout handling.

### Breaking Changes

- 💥 Made [Pandoc](**[Pandoc](https://pandoc.org/)**) optional in the conversion pipeline with native converter fallbacks when Pandoc is unavailable or fails.

### Fixed

- 🚑 Fixed legacy `.DOC` extraction and normalization for older Word documents.
- 🚑 Fixed `.RTF` extraction for older documents.

## [1.0.1]

### Updates

- 📝 Improved documentation
- 🧩 Extend Pandoc CLI support

## [1.0.0]

- 🚀 Initial release.
