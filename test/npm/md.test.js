import assert from "node:assert";
import { describe, test } from "node:test";
import { convertMarkdownToAdoc, mdToAdoc } from "../../dist/index.js";

describe("NPM: Markdown to AsciiDoc", () => {
	test("should convert Markdown string to AsciiDoc", () => {
		const mdContent = "# Title\n\n## Section\n\n**Bold** and *Italic*";
		const content = mdToAdoc(mdContent);

		assert.ok(content.includes("= Title"), "Missing level 1 header");
		assert.ok(content.includes("== Section"), "Missing level 2 header");
		assert.ok(content.includes("*Bold*"), "Missing bold");
		assert.ok(content.includes("_Italic_"), "Missing italic");
	});

	test("should convert Markdown via convertMarkdownToAdoc alias", () => {
		const mdContent = "# Title\n\n## Section\n\n**Bold** and *Italic*";
		const content = convertMarkdownToAdoc(mdContent);

		assert.ok(content.includes("= Title"), "Missing level 1 header");
		assert.ok(content.includes("== Section"), "Missing level 2 header");
	});

	test("should protect code blocks during conversion", () => {
		const mdContent = "```javascript\nconst x = 1;\n```";
		const content = mdToAdoc(mdContent);

		assert.ok(content.includes("[source,javascript]"), "Missing source block header");
		assert.ok(content.includes("----"), "Missing delimiters");
		assert.ok(content.includes("const x = 1;"), "Missing code content");
	});
});
