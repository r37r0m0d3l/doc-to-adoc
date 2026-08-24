import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

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

function normalizeFormat(format?: string): string | undefined {
	if (!format) {
		return undefined;
	}
	return format.replace(/^\./, "").toLowerCase();
}

function resolveInputSource(options: ConvertOptions): {
	kind: "file" | "inputString" | "inputBuffer";
	filePath?: string;
	content?: string | Buffer;
	format?: string;
} {
	const sources = [
		["inputFilePath", options.inputFilePath],
		["inputString", options.inputString],
		["inputBuffer", options.inputBuffer],
	].filter(([, filterValue]) => filterValue !== undefined);

	if (sources.length !== 1) {
		throw new Error(
			`Exactly one input source must be provided: inputFilePath, inputString, or inputBuffer. Received ${sources.length}.`,
		);
	}

	const [sourceName, value] = sources[0];

	if (sourceName === "inputFilePath") {
		if (typeof value === "string") {
			return {
				kind: "file",
				filePath: path.resolve(process.cwd(), value),
				format: normalizeFormat(options.fromFormat ?? path.extname(value).replace(/^\./, "")),
			};
		}

		if (value instanceof URL) {
			return {
				kind: "file",
				filePath: fileURLToPath(value),
				format: normalizeFormat(options.fromFormat ?? path.extname(fileURLToPath(value)).replace(/^\./, "")),
			};
		}

		if (Buffer.isBuffer(value)) {
			return {
				kind: "inputBuffer",
				content: value,
				format: normalizeFormat(options.fromFormat),
			};
		}

		throw new Error(`Unsupported input source type: ${typeof value}`);
	}

	if (sourceName === "inputString") {
		if (typeof value !== "string") {
			throw new Error("inputString input must be a string value.");
		}

		return {
			kind: "inputString",
			content: value,
			format: normalizeFormat(options.fromFormat) ?? "markdown",
		};
	}

	const bufferValue = Buffer.isBuffer(value) ? value : Buffer.from(value as Uint8Array);
	return {
		kind: "inputBuffer",
		content: bufferValue,
		format: normalizeFormat(options.fromFormat),
	};
}

export interface ConvertOptions {
	/**
	 * @name inputFilePath
	 * @description Source file path, file URL, or buffer representation.
	 * @type {string|Buffer|URL}
	 */
	inputFilePath?: string | Buffer | URL;

	/**
	 * @name inputString
	 * @description Raw text content to convert directly.
	 * @type {string}
	 */
	inputString?: string;

	/**
	 * @name inputBuffer
	 * @description Binary buffer or Uint8Array payload for direct conversion.
	 * @type {Buffer|Uint8Array}
	 */
	inputBuffer?: Buffer | Uint8Array;

	/**
	 * @name fromFormat
	 * @description Explicit input format hint when auto-detection is not possible.
	 * @type {string}
	 */
	fromFormat?: string;

	/**
	 * @name toFormat
	 * @description AsciiDoc output conversion target: adoc, markdown, or text.
	 * @type {string|"markdown"|"md"|"text"|"txt"}
	 */
	toFormat?: string | "markdown" | "md" | "text" | "txt";
}

async function convertAsciiDocOutput(result: string, type: string | undefined): Promise<string> {
	// PIPELINE: adoc -> markdown / text
	if (type === "md" || type === "markdown") {
		const html = await convertAdoc(result, { attributes: { doctype: "book" }, standalone: false });
		const turndownService = new TurndownService({ headingStyle: "atx" });
		turndownService.use(gfm);
		return turndownService.turndown(typeof html === "string" ? html : String(html ?? ""));
	}

	if (type === "txt" || type === "text") {
		const html = await convertAdoc(result, { attributes: { doctype: "book" }, standalone: false });
		const htmlStr = typeof html === "string" ? html : String(html ?? "");
		// Simple HTML to text conversion
		return htmlStr
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

async function convertInlinePayload(content: string | Buffer, format: string): Promise<string> {
	const normalizedFormat = normalizeFormat(format) ?? "text";
	const hasPandoc = isPandocAvailable();
	const pandocFormat = (PANDOC_PRIMARY_FORMATS as Record<string, string>)[`.${normalizedFormat}`] ?? normalizedFormat;

	if (hasPandoc && pandocFormat) {
		const result = spawnSync(pandocPath, ["-f", pandocFormat, "-t", "asciidoc"], {
			input: content,
			encoding: "utf-8",
		});
		if (result.status === 0) {
			return result.stdout;
		}
	}

	const text = typeof content === "string" ? content : content.toString("utf-8");

	switch (normalizedFormat) {
		case "csv":
			return convertCsvToAdoc(text, ",");
		case "tsv":
			return convertCsvToAdoc(text, "\t");
		case "html":
		case "htm":
			return convertHtmlToAdoc(text);
		case "json":
			return convertStructuredDataToAdoc(text, "json");
		case "yaml":
		case "yml":
			return convertStructuredDataToAdoc(text, "yaml");
		case "toml":
			return convertStructuredDataToAdoc(text, "toml");
		case "xml":
			return convertStructuredDataToAdoc(text, "xml");
		case "markdown":
		case "md":
		case "mdx":
		case "mdc":
			return mdToAdoc(text);
		case "pdf":
			return convertPdfToAdoc(Buffer.isBuffer(content) ? content : Buffer.from(text, "utf-8"));
		case "apng":
		case "bmp":
		case "gif":
		case "jpeg":
		case "jpg":
		case "pbm":
		case "png":
		case "tif":
		case "tiff":
		case "webp":
			return convertImageToAdoc(Buffer.isBuffer(content) ? content : Buffer.from(text, "utf-8"));
		case "doc":
			return convertDocToAdoc(Buffer.isBuffer(content) ? content : Buffer.from(text, "utf-8"));
		case "docx":
			return convertDocxToAdoc(Buffer.isBuffer(content) ? content : Buffer.from(text, "utf-8"));
		case "xlsx":
		case "ods":
			return convertSpreadsheetToAdoc(Buffer.isBuffer(content) ? content : Buffer.from(text, "utf-8"));
		case "odf":
		case "odt":
			return convertOdtToAdoc(Buffer.isBuffer(content) ? content : Buffer.from(text, "utf-8").toString());
		case "rtf":
			return convertRtfToAdoc(Buffer.isBuffer(content) ? content : Buffer.from(text, "utf-8").toString());
		default:
			return text;
	}
}

export async function convert(options: ConvertOptions): Promise<string> {
	const legacyOptions = options as ConvertOptions & {
		input?: string | Buffer | URL;
		type?: string;
	};
	const inputFilePath = options.inputFilePath ?? legacyOptions.input;
	const inputBuffer = options.inputBuffer;
	const toFormat = options.toFormat ?? legacyOptions.type ?? "adoc";
	const normalizedOptions: ConvertOptions = {
		...options,
		inputFilePath,
		inputBuffer,
		toFormat,
	};
	const resolvedSource = resolveInputSource(normalizedOptions);

	if (resolvedSource.kind === "file") {
		const inputFile = resolvedSource.filePath;
		if (!inputFile || !existsSync(inputFile)) {
			throw new Error(`File not found "${inputFile ?? ""}"`);
		}

		const ext = path.extname(inputFile).toLowerCase();
		const result = await getAdocContent(inputFile, ext);
		return convertAsciiDocOutput(result, toFormat);
	}

	const content = resolvedSource.content ?? "";
	const format = resolvedSource.format ?? "text";
	const result = await convertInlinePayload(content, format);
	return convertAsciiDocOutput(result, toFormat);
}
