import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { mdToAdoc } from "./convert-markdown.util.js";

/**
 * Escapes HTML special characters.
 */
export function escapeHtml(text: string): string {
	return (
		text
			//
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
	);
}

/**
 * Converts HTML content to AsciiDoc format.
 */
export function convertHtmlToAdoc(content: string): string {
	const cleanedHtml = content
		.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
		.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
	const turndownService = new TurndownService({ headingStyle: "atx" });
	turndownService.use(gfm);
	const markdown = turndownService.turndown(cleanedHtml);
	return mdToAdoc(markdown);
}
