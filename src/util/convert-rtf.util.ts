import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import pandocPath from "pandoc-binary";

import { isPandocAvailable } from "./pandoc.util.js";

const RTF_DESTINATIONS = new Set([
	"annotation",
	"background",
	"colortbl",
	"comment",
	"datastore",
	"defchp",
	"defpap",
	"do",
	"doccomm",
	"fonttbl",
	"footer",
	"footerf",
	"footerl",
	"footerr",
	"ftncn",
	"ftnsep",
	"ftnsepc",
	"header",
	"headerf",
	"headerl",
	"headerr",
	"info",
	"keycode",
	"keywords",
	"latentstyles",
	"listlevel",
	"listname",
	"listoverride",
	"listoverridetable",
	"listpicture",
	"listtable",
	"mailmerge",
	"mmathpr",
	"object",
	"objclass",
	"objdata",
	"pict",
	"private",
	"propname",
	"revtbl",
	"rsidtbl",
	"stylesheet",
	"subject",
	"themedata",
	"title",
	"txe",
	"xe",
	"xmlattrname",
	"xmlattrvalue",
	"xmlclose",
	"xmlname",
	"xmlopen",
]);

const RTF_CONTROL_WORD_REPLACEMENTS = new Map([
	["bullet", "* "],
	["cell", " | "],
	["emdash", "—"],
	["emspace", " "],
	["endash", "–"],
	["enspace", " "],
	["ldblquote", '"'],
	["line", "\n"],
	["lquote", "'"],
	["page", "\n\n"],
	["par", "\n\n"],
	["qmspace", " "],
	["rdblquote", '"'],
	["row", "\n"],
	["rquote", "'"],
	["sect", "\n\n"],
	["tab", "\t"],
]);

const RTF_CONTROL_SYMBOL_REPLACEMENTS = new Map([
	["-", ""],
	["_", "-"],
	["~", " "],
]);

const WINDOWS_1252_EXTENDED = new Map<number, string>([
	[0x80, "€"],
	[0x82, "‚"],
	[0x83, "ƒ"],
	[0x84, "„"],
	[0x85, "…"],
	[0x86, "†"],
	[0x87, "‡"],
	[0x88, "ˆ"],
	[0x89, "‰"],
	[0x8a, "Š"],
	[0x8b, "‹"],
	[0x8c, "Œ"],
	[0x8e, "Ž"],
	[0x91, "‘"],
	[0x92, "’"],
	[0x93, "“"],
	[0x94, "”"],
	[0x95, "•"],
	[0x96, "–"],
	[0x97, "—"],
	[0x98, "˜"],
	[0x99, "™"],
	[0x9a, "š"],
	[0x9b, "›"],
	[0x9c, "œ"],
	[0x9e, "ž"],
	[0x9f, "Ÿ"],
]);

function decodeWindows1252Byte(value: number): string {
	return WINDOWS_1252_EXTENDED.get(value) ?? String.fromCodePoint(value);
}

function normalizeRtfText(value: string): string {
	return value
		.replaceAll("\0", "")
		.replace(/\r\n?/g, "\n")
		.split("\n")
		.map((line) => line.replace(/[ \t]+/g, " ").trim())
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.replace(/ +\| +/g, " | ")
		.trim();
}

function consumeUnicodeFallback(source: string, startIndex: number, skipCount: number): number {
	let index = startIndex;
	let remaining = skipCount;
	while (index < source.length && remaining > 0) {
		const char = source[index];
		if (char === "\r" || char === "\n" || char === "{" || char === "}") {
			index += 1;
			continue;
		}
		if (char === "\\") {
			const next = source[index + 1];
			if (next === "'" && /^[\dA-Fa-f]{2}$/.test(source.slice(index + 2, index + 4))) {
				index += 4;
				remaining -= 1;
				continue;
			}
			if (next === "\\" || next === "{" || next === "}") {
				index += 2;
				remaining -= 1;
				continue;
			}
		}
		index += 1;
		remaining -= 1;
	}
	return index;
}

export function extractTextFromRtf(source: string): string {
	if (!source.includes("\\rtf")) {
		return normalizeRtfText(source);
	}

	const stateStack: Array<{ skipDestination: boolean; unicodeSkip: number }> = [{ skipDestination: false, unicodeSkip: 1 }];
	let index = 0;
	let output = "";
	let ignoreNextDestination = false;

	while (index < source.length) {
		const state = stateStack[stateStack.length - 1];
		const char = source[index];

		if (char === "{") {
			stateStack.push({ ...state });
			index += 1;
			continue;
		}

		if (char === "}") {
			if (stateStack.length > 1) {
				stateStack.pop();
			}
			index += 1;
			continue;
		}

		if (char === "\r" || char === "\n") {
			index += 1;
			continue;
		}

		if (char !== "\\") {
			if (!state.skipDestination) {
				output += char;
			}
			index += 1;
			continue;
		}

		index += 1;
		const next = source[index];
		if (!next) {
			break;
		}

		if (next === "*") {
			ignoreNextDestination = true;
			index += 1;
			continue;
		}

		if (next === "\\" || next === "{" || next === "}") {
			if (!state.skipDestination) {
				output += next;
			}
			index += 1;
			ignoreNextDestination = false;
			continue;
		}

		if (next === "'") {
			const hex = source.slice(index + 1, index + 3);
			if (!state.skipDestination && /^[\dA-Fa-f]{2}$/.test(hex)) {
				output += decodeWindows1252Byte(Number.parseInt(hex, 16));
			}
			index += 3;
			ignoreNextDestination = false;
			continue;
		}

		if (!/[A-Za-z]/.test(next)) {
			if (!state.skipDestination) {
				output += RTF_CONTROL_SYMBOL_REPLACEMENTS.get(next) ?? "";
			}
			index += 1;
			ignoreNextDestination = false;
			continue;
		}

		let word = "";
		while (index < source.length && /[A-Za-z]/.test(source[index])) {
			word += source[index];
			index += 1;
		}

		let sign = 1;
		if (source[index] === "-") {
			sign = -1;
			index += 1;
		}

		let digits = "";
		while (index < source.length && /\d/.test(source[index])) {
			digits += source[index];
			index += 1;
		}

		const parameter = digits.length > 0 ? sign * Number.parseInt(digits, 10) : undefined;
		if (source[index] === " ") {
			index += 1;
		}

		const normalizedWord = word.toLowerCase();
		if (ignoreNextDestination || RTF_DESTINATIONS.has(normalizedWord)) {
			stateStack[stateStack.length - 1].skipDestination = true;
			ignoreNextDestination = false;
			continue;
		}

		ignoreNextDestination = false;
		if (normalizedWord === "uc" && parameter !== undefined) {
			stateStack[stateStack.length - 1].unicodeSkip = parameter;
			continue;
		}

		if (normalizedWord === "u" && parameter !== undefined) {
			if (!state.skipDestination) {
				const codePoint = parameter < 0 ? parameter + 65_536 : parameter;
				output += String.fromCodePoint(codePoint);
			}
			index = consumeUnicodeFallback(source, index, stateStack[stateStack.length - 1].unicodeSkip);
			continue;
		}

		if (!state.skipDestination) {
			output += RTF_CONTROL_WORD_REPLACEMENTS.get(normalizedWord) ?? "";
		}
	}

	return normalizeRtfText(output);
}

export interface ConvertRtfToAdocOptions {
	usePandoc?: boolean;
}

function convertRtfWithPandoc(input: string | Buffer): string | null {
	if (typeof input === "string") {
		const res = spawnSync(pandocPath, ["-f", "rtf", input, "-t", "asciidoc"], { encoding: "utf-8" });
		if (res.status === 0 && res.stdout) {
			return res.stdout;
		}

		const retry = spawnSync(pandocPath, [input, "-t", "asciidoc"], { encoding: "utf-8" });
		if (retry.status === 0 && retry.stdout) {
			return retry.stdout;
		}

		return null;
	}

	const res = spawnSync(pandocPath, ["-f", "rtf", "-t", "asciidoc"], { input, encoding: "utf-8" });
	if (res.status === 0 && res.stdout) {
		return res.stdout;
	}

	return null;
}

/**
 * Converts an RTF (Rich Text Format) document to AsciiDoc.
 */
export async function convertRtfToAdoc(input: string | Buffer, options: ConvertRtfToAdocOptions = {}): Promise<string> {
	if (options.usePandoc !== false && isPandocAvailable()) {
		const pandocResult = convertRtfWithPandoc(input);
		if (pandocResult) {
			return pandocResult;
		}
	}

	const source = typeof input === "string" ? await fs.readFile(input, "latin1") : input.toString("latin1");
	return extractTextFromRtf(source);
}
