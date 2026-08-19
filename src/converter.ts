import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import * as path from "node:path";

import { convert as convertAdoc } from "@asciidoctor/core";
import pandocPath from "pandoc-binary";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

import { convertCsvToAdoc } from "./util/convert-csv.util.js";
import { convertDocToAdoc } from "./util/convert-doc.util.js";
import { convertDocxToAdoc } from "./util/convert-docx.util.js";
import { convertHtmlToAdoc } from "./util/convert-html.util.js";
import { convertImageToAdoc } from "./util/convert-image.util.js";
import { mdToAdoc } from "./util/convert-markdown.util.js";
import { convertOdtToAdoc } from "./util/convert-odt.util.js";
import { convertPdfToAdoc } from "./util/convert-pdf.util.js";
import { convertRtfToAdoc } from "./util/convert-rtf.util.js";
import { convertSpreadsheetToAdoc } from "./util/convert-spreadsheet.util.js";
import { convertStructuredDataToAdoc } from "./util/convert-structured.util.js";
import { isPandocAvailable } from "./util/pandoc.util.js";

//#region File Formats
const EXTENSIONS_NATIVE = {
	"APNG": ".apng",
	"BMP": ".bmp",
	"CSV": ".csv",
	"DOC": ".doc",
	"DOCX": ".docx",
	"GIF": ".gif",
	"HTM": ".htm",
	"HTML": ".html",
	"JPEG": ".jpeg",
	"JPG": ".jpg",
	"JSON": ".json",
	"MARKDOWN": ".markdown",
	"MD": ".md",
	"MDC": ".mdc",
	"MDX": ".mdx",
	"ODF": ".odf",
	"ODS": ".ods",
	"ODT": ".odt",
	"PBM": ".pbm",
	"PDF": ".pdf",
	"PNG": ".png",
	"RTF": ".rtf",
	"TIF": ".tif",
	"TIFF": ".tiff",
	"TOML": ".toml",
	"TSV": ".tsv",
	"WEBP": ".webp",
	"XLS": ".xls",
	"XLSX": ".xlsx",
	"XML": ".xml",
	"YAML": ".yaml",
	"YML": ".yml",
} as const;

Object.freeze(EXTENSIONS_NATIVE);

const EXTENSIONS_PANDOC = {
	"LATEX": ".latex",
	"MEDIAWIKI": ".mediawiki",
	"ORG": ".org",
	"RST": ".rst",
	"TEX": ".tex",
	"TYP": ".typ",
	"WIKI": ".wiki",
};

Object.freeze(EXTENSIONS_PANDOC);

const EXTENSIONS_SUPPORTED = {
	...EXTENSIONS_NATIVE,
	...EXTENSIONS_PANDOC,
} as const;

Object.freeze(EXTENSIONS_SUPPORTED);

// export type ExtensionNativeKeyType = keyof typeof EXTENSIONS_NATIVE;
// export type ExtensionNativeValueType = (typeof EXTENSIONS_NATIVE)[ExtensionNativeKeyType];

// export type ExtensionPandocKeyType = keyof typeof EXTENSIONS_PANDOC;
// export type ExtensionPandocValueType = (typeof EXTENSIONS_PANDOC)[ExtensionPandocKeyType];

// export type ExtensionSupportedKeyType = keyof typeof EXTENSIONS_SUPPORTED;
// export type ExtensionSupportedValueType = (typeof EXTENSIONS_SUPPORTED)[ExtensionSupportedKeyType];
//#endregion File Formats

/**
 * Map of extensions that Pandoc excels at converting natively.
 */
const PANDOC_PRIMARY_FORMATS = {
	[EXTENSIONS_SUPPORTED.HTML]: "html",
	[EXTENSIONS_SUPPORTED.HTM]: "html",
	[EXTENSIONS_SUPPORTED.LATEX]: "latex",
	[EXTENSIONS_SUPPORTED.MARKDOWN]: "markdown",
	[EXTENSIONS_SUPPORTED.MDC]: "markdown",
	[EXTENSIONS_SUPPORTED.MDX]: "markdown",
	[EXTENSIONS_SUPPORTED.MD]: "markdown",
	[EXTENSIONS_SUPPORTED.MEDIAWIKI]: "mediawiki",
	[EXTENSIONS_SUPPORTED.ODF]: "odt",
	[EXTENSIONS_SUPPORTED.ODT]: "odt",
	[EXTENSIONS_SUPPORTED.ORG]: "org",
	[EXTENSIONS_SUPPORTED.RST]: "rst",
	[EXTENSIONS_SUPPORTED.RTF]: "rtf",
	[EXTENSIONS_SUPPORTED.TEX]: "latex",
	[EXTENSIONS_SUPPORTED.WIKI]: "mediawiki",
} as const;

// ---------------------------------------------------------------------------
// Master Dispatcher
// ---------------------------------------------------------------------------
async function convertNativeFallback(inputFile: string, ext: string): Promise<string> {
	const fileBuffer = await fs.readFile(inputFile);
	const utf8Text = fileBuffer.toString("utf-8");

	switch (ext.toLowerCase()) {
		// 1. PDF & Images (OCR fallback)
		case EXTENSIONS_SUPPORTED.PDF:
			return convertPdfToAdoc(fileBuffer);

		case EXTENSIONS_SUPPORTED.APNG:
		case EXTENSIONS_SUPPORTED.BMP:
		case EXTENSIONS_SUPPORTED.GIF:
		case EXTENSIONS_SUPPORTED.JPEG:
		case EXTENSIONS_SUPPORTED.JPG:
		case EXTENSIONS_SUPPORTED.PBM:
		case EXTENSIONS_SUPPORTED.PNG:
		case EXTENSIONS_SUPPORTED.TIF:
		case EXTENSIONS_SUPPORTED.TIFF:
		case EXTENSIONS_SUPPORTED.WEBP:
			return convertImageToAdoc(fileBuffer);

		// 2. Word Documents
		case EXTENSIONS_SUPPORTED.DOC:
			return convertDocToAdoc(fileBuffer);
		case EXTENSIONS_SUPPORTED.DOCX:
			return convertDocxToAdoc(fileBuffer);

		// 3. Tabular Data
		case EXTENSIONS_SUPPORTED.CSV:
			return convertCsvToAdoc(utf8Text, ",");
		case EXTENSIONS_SUPPORTED.TSV:
			return convertCsvToAdoc(utf8Text, "\t");
		case EXTENSIONS_SUPPORTED.XLSX:
		case EXTENSIONS_SUPPORTED.ODS:
			return convertSpreadsheetToAdoc(fileBuffer);

		// 4. HTML
		case EXTENSIONS_SUPPORTED.HTML:
		case EXTENSIONS_SUPPORTED.HTM:
			return convertHtmlToAdoc(utf8Text);

		// 5. Structured Data & Configs
		case EXTENSIONS_SUPPORTED.JSON:
			return convertStructuredDataToAdoc(utf8Text, "json");
		case EXTENSIONS_SUPPORTED.YAML:
		case EXTENSIONS_SUPPORTED.YML:
			return convertStructuredDataToAdoc(utf8Text, "yaml");
		case EXTENSIONS_SUPPORTED.TOML:
			return convertStructuredDataToAdoc(utf8Text, "toml");
		case EXTENSIONS_SUPPORTED.XML:
			return convertStructuredDataToAdoc(utf8Text, "xml");

		// 6. Markdown Light Fallbacks
		case EXTENSIONS_SUPPORTED.MD:
		case EXTENSIONS_SUPPORTED.MARKDOWN:
		case EXTENSIONS_SUPPORTED.MDX:
		case EXTENSIONS_SUPPORTED.MDC:
			return mdToAdoc(utf8Text);

		// 7. ODT & RTF
		case EXTENSIONS_SUPPORTED.ODF:
		case EXTENSIONS_SUPPORTED.ODT:
			return convertOdtToAdoc(inputFile);
		case EXTENSIONS_SUPPORTED.RTF:
			return convertRtfToAdoc(inputFile);

		default:
			return utf8Text;
	}
}

async function getAdocContent(inputFile: string, ext: string): Promise<string> {
	const hasPandoc = isPandocAvailable();
	if (hasPandoc && PANDOC_PRIMARY_FORMATS[ext]) {
		const format = PANDOC_PRIMARY_FORMATS[ext];
		const args = [inputFile, "-t", "asciidoc"];
		if (format) {
			args.unshift("-f", format);
		}
		const result = spawnSync(pandocPath, args, { encoding: "utf-8" });
		if (result.status === 0) {
			return result.stdout;
		}

		const retry = spawnSync(pandocPath, [inputFile, "-t", "asciidoc"], { encoding: "utf-8" });
		if (retry.status === 0) {
			return retry.stdout;
		}
	}

	return convertNativeFallback(inputFile, ext);
}

export interface ConvertOptions {
	/**
	 * @name input
	 * @description Source file path
	 * @type string
	 */
	input: string;
	/**
	 * @name type
	 * @description Pipe to type: AsciiDoc -> Markdown, AsciiDoc -> plain text
	 * @type string
	 */
	type?: string | "markdown" | "md" | "text" | "txt";
}

export async function convert(options: ConvertOptions): Promise<string> {
	const {
		input,
		type = "adoc", // defaults to
	} = options;
	const resolvedInput = path.resolve(process.cwd(), input);
	if (!existsSync(resolvedInput)) {
		throw new Error(`File not found "${resolvedInput}"`);
	}

	const ext = path.extname(resolvedInput).toLowerCase();
	let result = await getAdocContent(resolvedInput, ext);

	// PIPELINE: adoc -> markdown / text
	if (type === "md" || type === "markdown") {
		const html = await convertAdoc(result, { attributes: { doctype: "book" }, standalone: false });
		const turndownService = new TurndownService({ headingStyle: "atx" });
		turndownService.use(gfm);
		result = turndownService.turndown(typeof html === "string" ? html : String(html ?? ""));
	} else if (type === "txt" || type === "text") {
		const html = await convertAdoc(result, { attributes: { doctype: "book" }, standalone: false });
		const htmlStr = typeof html === "string" ? html : String(html ?? "");
		// Simple HTML to text conversion
		result = htmlStr
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
			.replace(/\r?\n/g, " ")
			.replace(/<h[1-6][^>]*>/gi, "\n\n")
			.replace(/<p[^>]*>/gi, "\n\n")
			.replace(/<br[^>]*>/gi, "\n")
			.replace(/<li[^>]*>/gi, "\n* ")
			.replace(/<tr[^>]*>/gi, "\n")
			.replace(/<(?:td|th)[^>]*>/gi, " | ")
			.replace(/<div[^>]*>/gi, "\n")
			.replace(/<[^>]*>/g, "")
			.replace(/&nbsp;/g, " ")
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/[ \t]+/g, " ")
			.replace(/ \| \s+/g, " | ")
			.replace(/\* \s+/g, "* ")
			.replace(/\n\s*\n\s*\n+/g, "\n\n")
			.trim();
	}

	return result;
}
