import { XMLParser } from "fast-xml-parser";
import * as yaml from "js-yaml";
import { parse as parseToml } from "smol-toml";

const xmlParser = new XMLParser({ ignoreAttributes: false });

/**
 * Converts JS Objects into recursive AsciiDoc bullet trees.
 */
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

/**
 * Converts Structured Data (JSON, YAML, TOML, XML) into AsciiDoc bullet tree or source block.
 */
export function convertStructuredDataToAdoc(content: unknown, format: "json" | "yaml" | "toml" | "xml"): string {
	let parsed = content;
	if (typeof content === "string") {
		try {
			if (format === "json") {
				parsed = JSON.parse(content);
			} else if (format === "yaml") {
				parsed = yaml.load(content);
			} else if (format === "toml") {
				parsed = parseToml(content);
			} else if (format === "xml") {
				parsed = xmlParser.parse(content);
			}
		} catch {
			return `[source,${format}]\n----\n${content.trim()}\n----\n`;
		}
	}
	if (typeof parsed !== "object" || parsed === null) {
		return `[source,${format}]\n----\n${String(parsed).trim()}\n----\n`;
	}
	return objectToAdocTree(parsed as Record<string, unknown>);
}
