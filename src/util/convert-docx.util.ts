import mammoth from "mammoth";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { mdToAdoc } from "./convert-markdown.util.js";

/**
 * Converts DOCX buffer to HTML using Mammoth.
 */
export async function convertDocxToHtml(buffer: Buffer): Promise<string> {
	const { value: html } = await mammoth.convertToHtml({ buffer });
	return html;
}

/**
 * Converts DOCX buffer to Markdown using Mammoth and Turndown.
 */
export async function convertDocxToMarkdown(buffer: Buffer): Promise<string> {
	const html = await convertDocxToHtml(buffer);
	const turndownService = new TurndownService({ headingStyle: "atx" });
	turndownService.use(gfm);
	return turndownService.turndown(html);
}

/**
 * Converts DOCX buffer to AsciiDoc.
 */
export async function convertDocxToAdoc(buffer: Buffer): Promise<string> {
	const markdown = await convertDocxToMarkdown(buffer);
	return mdToAdoc(markdown);
}
