# 2adoc 📄➡️📝

> Universal utility (CLI & Library) to convert 21 document and structured data formats into canonical **AsciiDoc (`.adoc`)**.

Designed as a single-command ingestion engine for technical writers, local LLM RAG pipelines, and document processing
workflows.

## Features

- ⚙️ **Smart Pandoc Detection:** Automatically uses system `pandoc` when present, with native fallback logic
  for complex formats (PDF, DOCX, XLSX, etc.).
- 📦 **Zero-Setup ESM:** Transpiled for Node.js 20+ (supports v26+) and TypeScript.
- 🚀 **Supported Input Formats:**
    - **Documents:** PDF, DOC, DOCX, RTF, ODT (ODF), HTML, TEX (LaTeX)
    - **Markup:** Markdown (MD, MDX), AsciiDoc (re-processing), MediaWiki, Org-mode, ReStructuredText (RST)
    - **Data:** JSON, YAML, TOML, XML, CSV, TSV, XLSX (Excel), ODS

## 🚀 Usage

### Library Usage
```javascript
import { convert } from '2adoc';

const content = await convert({
  input: './my.docx',
  type: 'adoc' // optional: 'adoc', 'md', 'txt'
});
console.log(content);
```

### CLI Usage

### Basic Conversion
```bash
# Convert DOCX to AsciiDoc
2adoc ./my.docx ./my.adoc
```

### Output Types
Support for different output formats via `-type` (or `--type`, `-t`):
- `adoc`, `asciidoc` (default): Standard AsciiDoc output.
- `md`, `markdown`: Converts through the pipeline `input -> asciidoc -> markdown`.
- `txt`, `text`: Converts through the pipeline `input -> asciidoc -> plain text`.

```bash
# Convert PDF to Markdown
2adoc -input ./report.pdf -type markdown

# Convert Excel to Plain Text
2adoc ./data.xlsx ./output.txt -type text
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
2adoc ./my.docx ./my.adoc
```

```bash
# Run from anywhere without chmod
2adoc ./my.docx ./my.txt -t txt
```
