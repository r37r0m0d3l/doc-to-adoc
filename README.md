# doc-to-adoc 📄➡️📝

> Universal utility (CLI & Library) to convert document and structured data formats into canonical **AsciiDoc (`.adoc`)**.

Designed as a single-command ingestion engine for technical writers, local LLM RAG pipelines, and document processing
workflows.

## Features

- ⚙️ **Smart Pandoc Detection:** Automatically uses system `pandoc` when present, with native fallback logic
  for complex formats (PDF, DOCX, XLSX, etc.).
- 📦 **Zero-Setup ESM:** Transpiled for Node.js ESM and TypeScript.
- 🚀 **Supported Input Formats:**
    - **Documents:** PDF, DOC, DOCX, RTF, ODT (ODF), HTML, TEX (LaTeX)
    - **Markup:** Markdown (MD, MDX), AsciiDoc (re-processing), MediaWiki, Org-mode, ReStructuredText (RST)
    - **Data:** JSON, YAML, TOML, XML, CSV, TSV, XLSX (Excel), ODS

## 🚀 Usage

### Prerequisites: Pandoc Installation

This is **NOT REQUIRED** but **HIGHLY RECOMMENDED**. This package utilizes system-installed **[Pandoc](https://pandoc.org/)** when available to process document conversions. While basic features may run without it, installing **Pandoc** enables **full functionality and potential** when converting document-like formats.

<details>
    <summary><b>🐧 Linux</b></summary>

Install via your distribution's standard package manager:

**Alpine:**

```bash
apk add pandoc
```

**Arch Linux:**

```bash
sudo pacman -S pandoc
```

**Debian / Ubuntu:**

```bash
sudo apt-get update
sudo apt-get install -y pandoc
```

</details>

<details>
    <summary><b>🍏 macOS</b></summary>

Install using <b>Homebrew</b>:

```shell
brew install pandoc
```

</details>

<details>
    <summary><b>🪟 Windows</b></summary>

Install using <b>WinGet</b>:

```powershell
winget install JohnMacFarlane.Pandoc
```

</details>

<details>
    <summary><b>✅ Verifying installation</b></summary>

```bash
pandoc --version
```

</details>

### Node.js Usage

```javascript
import { convert } from 'doc-to-adoc';

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
