import assert from "node:assert";
import { describe, test } from "node:test";
import { mdToAdoc } from "../../bin/converter.js";

describe("NPM: Enhanced Markdown to AsciiDoc", () => {
	test("should convert unordered lists", () => {
		const mdContent = "- Item 1\n* Item 2\n+ Item 3";
		const adoc = mdToAdoc(mdContent);

		assert.ok(adoc.includes("* Item 1"), "Unordered list (-) failed");
		assert.ok(adoc.includes("* Item 2"), "Unordered list (*) failed");
		assert.ok(adoc.includes("* Item 3"), "Unordered list (+) failed");
	});

	test("should convert ordered lists", () => {
		const mdContent = "1. First\n2. Second";
		const adoc = mdToAdoc(mdContent);

		assert.ok(adoc.includes(". First"), "Ordered list (1.) failed");
		assert.ok(adoc.includes(". Second"), "Ordered list (2.) failed");
	});

	test("should convert links", () => {
		const mdContent = "[Google](https://google.com)";
		const adoc = mdToAdoc(mdContent);

		assert.ok(adoc.includes("https://google.com[Google]"), "Link failed");
	});

	test("should convert images", () => {
		const mdContent = "![Alt text](image.png)";
		const adoc = mdToAdoc(mdContent);

		assert.ok(adoc.includes("image:image.png[Alt text]"), "Image failed");
	});

	test("should convert blockquotes", () => {
		const mdContent = "> This is a quote";
		const adoc = mdToAdoc(mdContent);

		assert.ok(adoc.includes("[quote]\n____\nThis is a quote\n____"), "Blockquote failed");
	});

	test("should convert horizontal rules", () => {
		const mdContent = "---\n***\n___";
		const adoc = mdToAdoc(mdContent);

		const lines = adoc.split("\n").filter((l) => l.trim() === "'''");
		assert.strictEqual(lines.length, 3, "Horizontal rules failed");
	});

	test("should convert basic tables", () => {
		const mdContent = "| H1 | H2 |\n|---|---|\n| V1 | V2 |";
		const adoc = mdToAdoc(mdContent);

		assert.ok(adoc.includes('[options="header"]'), "Missing table header option");
		assert.ok(adoc.includes("|==="), "Missing table delimiters");
		assert.ok(adoc.includes("| H1 | H2"), "Missing header content");
		assert.ok(adoc.includes("| V1 | V2"), "Missing row content");
	});
});
