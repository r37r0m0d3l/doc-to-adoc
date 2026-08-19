# doc-to-adoc 📄➡️📝

> Universal CLI and Library to convert document, markup, image, and structured data formats into canonical **AsciiDoc (`.adoc`)**.


Designed as a single-command ingestion engine for technical documentation, local LLM RAG pipelines, and automated document conversion workflows.

## Features

- 📦 **Zero-Setup ESM:** Ready for Node.js ESM and TypeScript.
- ⚗️ **Unified Pipeline:** Single dependency for RAG context extraction and document conversion—no complex external dependencies required.
- 🚀 **Extensive Format Support:** Ingest documents, tabular data, markup, and image text seamlessly.

## Supported Formats

| Category         | Extensions                                                                                         |
|:-----------------|:---------------------------------------------------------------------------------------------------|
| **Documents**    | `.doc`, `.docx`, `.pdf`, `.rtf`, `.odf`, `.odt`, `.latex`, `.tex`                                  |
| **Data**         | `.csv`, `.json`, `.ods`, `.tsv`, `.xls`, `.xlsx`, `.xml`, `.yaml`, `.yml`, `.toml`                 |
| **Markup**       | `.htm`, `.html`, `.md`, `.markdown`, `.mdc`, `.mdx`, `.mediawiki`, `.org`, `.rst`, `.typ`, `.wiki` |
| **Images (OCR)** | `.apng`, `.bmp`, `.gif`, `.jpeg`, `.jpg`, `.pbm`, `.png`, `.tif`, `.tiff`, `.webp`                 |

## 🚀 Usage

When choosing a markup format for technical writing, LLM RAG pipelines, or general documentation, **AsciiDoc**, **Markdown**, and **Plain Text** sit at distinct points along the spectrum of complexity versus functionality.

- Use **AsciiDoc** when building **structured**, technical documentation or LLM ingestion pipelines where explicit **semantic metadata** are **critical**.
- Use **Markdown** for lightweight, **human-facing** docs where **universal rendering** matters most.
- Use **Plain Text** only when structural context is **completely unnecessary**.

### Node.js Usage

```javascript
import { convert } from 'doc-to-adoc';

const content = await convert({
  input: './my.docx',
  type: 'adoc' // Options: 'adoc' | 'md' | 'txt'
});
console.log(content);
```

### CLI Usage

### Basic Conversion

```bash
# Convert DOCX to AsciiDoc
doc-to-adoc ./my.docx ./my.adoc
```

### Output Types

Support for different output formats via `-type` (or `--type`, `-t`):
- `adoc`, `asciidoc` (default): Standard AsciiDoc output.
- `md`, `markdown`: Converts through the pipeline `input -> asciidoc -> markdown`.
- `txt`, `text`: Converts through the pipeline `input -> asciidoc -> plain text`.

```bash
# Convert PDF to Markdown
doc-to-adoc -input ./report.pdf -type markdown

# Convert Excel to Plain Text
doc-to-adoc ./data.xlsx ./output.txt -type text
```

## 🚀 Local Execution

```bash
# Transpile TypeScript into ./bin/
npm run build
```

```bash
# Link globally for local testing
npm link
```

```bash
# Run from anywhere without chmod
doc-to-adoc ./my.docx ./my.adoc
```

```bash
# Run from anywhere without chmod
doc-to-adoc ./my.docx ./my.txt -t txt
```
