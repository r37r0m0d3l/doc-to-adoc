import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import * as path from "node:path";

import { convert as convertAdoc } from "@asciidoctor/core";
import { parse as parseCsv } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";
import * as yaml from "js-yaml";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { parse as parseToml } from "smol-toml";
import TurndownService from "turndown";
import { utils as excelUtils, read as readExcel } from "xlsx";

// Initialize persistent parsers
const xmlParser = new XMLParser({ ignoreAttributes: false });

/**
 * Map of extensions that Pandoc excels at converting natively.
 */
export const PANDOC_PRIMARY_FORMATS: Record<string, string> = {
	".htm": "html",
	".html": "html",
	".latex": "latex",
	".markdown": "markdown",
	".md": "markdown",
	".mdx": "markdown",
	".mediawiki": "mediawiki",
	".odf": "odt",
	".odt": "odt",
	".org": "org",
	".rst": "rst",
	".rtf": "rtf",
	".tex": "latex",
	".wiki": "mediawiki",
};

export function isPandocAvailable(): boolean {
	try {
		const res = spawnSync("pandoc", ["--version"], { stdio: "ignore" });
		return res.status === 0 && !res.error;
	} catch {
		return false;
	}
}

// ---------------------------------------------------------------------------
// Native TS Converters (Handles formats Pandoc can't read or handle cleanly)
// ---------------------------------------------------------------------------

// 1. PDF Conversion (pdf-parse)
export async function convertPdfToAdoc(buffer: Buffer): Promise<string> {
	const parser = new PDFParse({ data: buffer });
	try {
		const info = await parser.getInfo();
		const title = info.info?.Title?.trim();
		const result = await parser.getText();

		if (title) {
			return `= ${title}\n\n${result.text}`;
		}

		return result.text;
	} finally {
		await parser.destroy();
	}
}

// 2. DOC / DOCX Extraction (mammoth)
export async function convertDocxToAdoc(buffer: Buffer): Promise<string> {
	// biome-ignore lint/suspicious/noExplicitAny: No exported type
	const { value: markdown } = await (mammoth as any).convertToMarkdown({ buffer });
	return mdToAdoc(markdown);
}

// 3. Tabular Conversion (CSV / TSV)
export function convertCsvToAdoc(content: string, delimiter = ","): string {
	const records: string[][] = parseCsv(content, { skip_empty_lines: true, delimiter });
	if (records.length === 0) return "";

	const headers = records[0];
	const rows = records.slice(1);

	let adoc = '[options="header"]\n|===\n';
	adoc += `| ${headers.map((h) => String(h).replace(/\|/g, "\\|")).join(" | ")}\n\n`;

	for (const row of rows) {
		adoc += `| ${row.map((cell) => String(cell).replace(/\|/g, "\\|")).join(" | ")}\n`;
	}
	adoc += "|===\n";
	return adoc;
}

// 4. Excel / ODS Conversion (xlsx)
export function convertSpreadsheetToAdoc(buffer: Buffer): string {
	const workbook = readExcel(buffer);
	const firstSheetName = workbook.SheetNames[0];
	if (!firstSheetName) return "";

	const sheet = workbook.Sheets[firstSheetName];
	const csvData = excelUtils.sheet_to_csv(sheet);
	return convertCsvToAdoc(csvData, ",");
}

// 5. HTML Conversion (turndown)
export function convertHtmlToAdoc(content: string): string {
	const cleanedHtml = content
		.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
		.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

	const turndownService = new TurndownService({ headingStyle: "atx" });
	const markdown = turndownService.turndown(cleanedHtml);
	return mdToAdoc(markdown);
}

// 6. Structured Data / XML Conversion (fast-xml-parser / JSON)
export function convertStructuredDataToAdoc(content: unknown, format: "json" | "yaml" | "toml" | "xml"): string {
	let parsed = content;

	if (typeof content === "string") {
		try {
			if (format === "json") parsed = JSON.parse(content);
			else if (format === "yaml") parsed = yaml.load(content);
			else if (format === "toml") parsed = parseToml(content);
			else if (format === "xml") parsed = xmlParser.parse(content);
		} catch {
			return `[source,${format}]\n----\n${content.trim()}\n----\n`;
		}
	}

	if (typeof parsed !== "object" || parsed === null) {
		return `[source,${format}]\n----\n${String(parsed).trim()}\n----\n`;
	}
	return objectToAdocTree(parsed as Record<string, unknown>);
}

// Helper to convert JS Objects into recursive AsciiDoc bullet trees
export function objectToAdocTree(obj: Record<string, unknown>, depth = 1): string {
	let adoc = "";
	const prefix = "*".repeat(depth);

	for (const [key, val] of Object.entries(obj)) {
		if (typeof val === "object" && val !== null) {
			adoc += `${prefix} *${key}:*\n`;
			adoc += objectToAdocTree(val as Record<string, unknown>, depth + 1);
		} else {
			adoc += `${prefix} *${key}:* ${val}\n`;
		}
	}
	return adoc;
}

// Native Markdown Fallback
export function mdToAdoc(content: string): string {
	const codeBlocks: string[] = [];
	let adoc = content;

	// 1. Protect code blocks
	adoc = adoc.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang: string, code: string) => {
		const placeholder = `§CODEBLOCK${codeBlocks.length}§`;
		codeBlocks.push(`${lang ? `[source,${lang}]\n` : "[source]\n"}----\n${code.trim()}\n----\n`);
		return placeholder;
	});

	// 2. Horizontal Rules (Must be before Bold/Italic to avoid corruption)
	adoc = adoc.replace(/^[*+_-]{3,}$/gm, "'''");

	// 3. Bold & Italic (using placeholders to avoid interference with other rules)
	adoc = adoc.replace(/(\*\*\*|___)(.*?)\1/g, "§BI§$2§BI§"); // Bold-Italic
	adoc = adoc.replace(/(\*\*|__)(.*?)\1/g, "§B§$2§B§"); // Bold
	adoc = adoc.replace(/(\*|_)(.*?)\1/g, "§I§$2§I§"); // Italic

	// 4. Headers (handling optional anchors from Mammoth)
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm, "====== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm, "===== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm, "==== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm, "=== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm, "== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm, "= $1");

	// 5. Blockquotes
	adoc = adoc.replace(/(^>.*\n?)+/gm, (match) => {
		const lines = match
			.split("\n")
			.map((line) => line.replace(/^>\s?/, ""))
			.filter((line) => line.length > 0)
			.join("\n");
		return `[quote]\n____\n${lines}\n____\n\n`;
	});

	// 6. Lists
	// Unordered lists
	adoc = adoc.replace(/^[ \t]*[-*+]\s+(.*)$/gm, "* $1");
	// Ordered lists
	adoc = adoc.replace(/^[ \t]*\d+\.\s+(.*)$/gm, ". $1");

	// 7. Tables (Basic GFM support)
	adoc = adoc.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm, (_match, headerLine, body) => {
		const parseRow = (row: string) =>
			row
				.split("|")
				.filter((_, i, arr) => i > 0 && i < arr.length - 1)
				.map((c) => c.trim());
		const headers = parseRow(headerLine);
		const rows = body.trim().split("\n").map(parseRow);

		let table = '[options="header"]\n|===\n';
		table += `| ${headers.join(" | ")}\n`;
		for (const row of rows) {
			table += `| ${row.join(" | ")}\n`;
		}
		table += "|===\n";
		return table;
	});

	// 8. Images & Links
	// Images first
	adoc = adoc.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "image:$2[$1]");
	// Links
	adoc = adoc.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2[$1]");

	// 9. Restore Bold & Italic
	adoc = adoc.replace(/§BI§/g, "***");
	adoc = adoc.replace(/§B§/g, "*");
	adoc = adoc.replace(/§I§/g, "_");

	// 10. Restore code blocks
	codeBlocks.forEach((block, i) => {
		adoc = adoc.replace(`§CODEBLOCK${i}§`, block);
	});

	return adoc.trim();
}

// ---------------------------------------------------------------------------
// Master Dispatcher
// ---------------------------------------------------------------------------
export async function convertNativeFallback(inputFile: string, ext: string): Promise<string> {
	const fileBuffer = await fs.readFile(inputFile);
	const utf8Text = fileBuffer.toString("utf-8");

	switch (ext.toLowerCase()) {
		// 1. PDF
		case ".pdf":
			return convertPdfToAdoc(fileBuffer);

		// 2. Word Documents (Mammoth only supports .docx)
		case ".docx":
			return convertDocxToAdoc(fileBuffer);

		// 3. Tabular Data
		case ".csv":
			return convertCsvToAdoc(utf8Text, ",");
		case ".tsv":
			return convertCsvToAdoc(utf8Text, "\t");
		case ".xlsx":
		case ".ods":
			return convertSpreadsheetToAdoc(fileBuffer);

		// 4. HTML
		case ".html":
		case ".htm":
			return convertHtmlToAdoc(utf8Text);

		// 5. Structured Data & Configs
		case ".json":
			return convertStructuredDataToAdoc(JSON.parse(utf8Text), "json");
		case ".yaml":
		case ".yml":
			return convertStructuredDataToAdoc(yaml.load(utf8Text), "yaml");
		case ".toml":
			return convertStructuredDataToAdoc(parseToml(utf8Text), "toml");
		case ".xml":
			return convertStructuredDataToAdoc(xmlParser.parse(utf8Text), "xml");

		// 6. Markdown Light Fallbacks
		case ".md":
		case ".markdown":
		case ".mdx":
			return mdToAdoc(utf8Text);

		default:
			return utf8Text;
	}
}

export async function getAdocContent(inputFile: string, ext: string): Promise<string> {
	const hasPandoc = isPandocAvailable();
	if (hasPandoc && PANDOC_PRIMARY_FORMATS[ext]) {
		const format = PANDOC_PRIMARY_FORMATS[ext];
		const args = [inputFile, "-t", "asciidoc"];
		if (format) {
			args.unshift("-f", format);
		}
		const result = spawnSync("pandoc", args, { encoding: "utf-8" });
		if (result.status === 0) return result.stdout;

		const retry = spawnSync("pandoc", [inputFile, "-t", "asciidoc"], { encoding: "utf-8" });
		if (retry.status === 0) return retry.stdout;
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
	 * @anme type
	 * @description Pipe to type: AsciiDoc -> Markdown, AsciiDoc -> plain text
	 * @type string
	 */
	type?: string | "markdown" | "md" | "text" | "txt";
}

export async function convert(options: ConvertOptions): Promise<string> {
	const { input, type = "adoc" } = options;
	const resolvedInput = path.resolve(process.cwd(), input);
	if (!existsSync(resolvedInput)) {
		throw new Error(`File not found "${resolvedInput}"`);
	}

	const ext = path.extname(resolvedInput).toLowerCase();
	let result = await getAdocContent(resolvedInput, ext);

	// PIPELINE: adoc -> markdown / text
	if (type === "md" || type === "markdown") {
		const html = await convertAdoc(result, { attributes: { doctype: "book" } });
		const turndownService = new TurndownService({ headingStyle: "atx" });
		result = turndownService.turndown(html as string);
	} else if (type === "txt" || type === "text") {
		const html = await convertAdoc(result, { attributes: { doctype: "book" } });
		// Simple HTML to text conversion
		result = (html as string)
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
