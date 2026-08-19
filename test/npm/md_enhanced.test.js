import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { convert } from "../../dist/index.js";

function writeTempFile(extension, content) {
	const filePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "doc-to-adoc-")), `sample${extension}`);
	fs.writeFileSync(filePath, content, "utf-8");
	return filePath;
}

describe("NPM: Enhanced Markdown to AsciiDoc", () => {
	test("should convert unordered lists", async () => {
		const mdContent = "- Item 1\n* Item 2\n+ Item 3";
		const tempFile = writeTempFile(".md", mdContent);
		const adoc = await convert({ input: tempFile });

		assert.ok(adoc.includes("* Item 1"), "Unordered list (-) failed");
		assert.ok(adoc.includes("* Item 2"), "Unordered list (*) failed");
		assert.ok(adoc.includes("* Item 3"), "Unordered list (+) failed");
	});

	test("should convert ordered lists", async () => {
		const mdContent = "1. First\n2. Second";
		const tempFile = writeTempFile(".md", mdContent);
		const adoc = await convert({ input: tempFile });

		assert.ok(adoc.includes(". First"), "Ordered list (1.) failed");
		assert.ok(adoc.includes(". Second"), "Ordered list (2.) failed");
	});

	test("should convert links", async () => {
		const mdContent = "[Google](https://google.com)";
		const tempFile = writeTempFile(".md", mdContent);
		const adoc = await convert({ input: tempFile });

		assert.ok(adoc.includes("https://google.com[Google]"), "Link failed");
	});

	test("should handle links and images with special replacement patterns ($1, $2, $&)", async () => {
		const mdContent = "[Product](https://example.com/item?price=$10&currency=$$USD)\n![Diagram](https://example.com/img.png?rev=$1)";
		const tempFile = writeTempFile(".md", mdContent);
		const adoc = await convert({ input: tempFile });

		assert.ok(adoc.includes("https://example.com/item?price=$10&currency=$$USD[Product]"), "Link with $ failed");
		assert.ok(adoc.includes("image:https://example.com/img.png?rev=$1[Diagram]"), "Image with $ failed");
	});

	test("should convert blockquotes", async () => {
		const mdContent = "> This is a quote";
		const tempFile = writeTempFile(".md", mdContent);
		const adoc = await convert({ input: tempFile });
		const normalized = adoc.replace(/\r/g, "");

		assert.ok(normalized.includes("____\nThis is a quote\n____"), "Blockquote failed");
	});

	test("should convert multi-paragraph and nested blockquotes cleanly", async () => {
		const mdContent = "> First paragraph\n>\n> Second paragraph";
		const tempFile = writeTempFile(".md", mdContent);
		const adoc = await convert({ input: tempFile });
		const normalized = adoc.replace(/\r/g, "");

		assert.ok(normalized.includes("____\nFirst paragraph\n\nSecond paragraph\n____"), "Multi-paragraph blockquote failed");
	});

	test("should convert horizontal rules", async () => {
		const mdContent = "---\n***\n___";
		const tempFile = writeTempFile(".md", mdContent);
		const adoc = await convert({ input: tempFile });
		const normalized = adoc.replace(/\r/g, "");

		const lines = normalized.split("\n").filter((line) => line.trim() === "'''''");
		assert.strictEqual(lines.length, 3, "Horizontal rules failed");
	});

	test("should convert basic tables", async () => {
		const mdContent = "| H1 | H2 |\n|---|---|\n| V1 | V2 |";
		const tempFile = writeTempFile(".md", mdContent);
		const adoc = await convert({ input: tempFile });
		const normalized = adoc.replace(/\r/g, "");

		assert.ok(normalized.includes('[cols=",",options="header",]'), "Missing table header option");
		assert.ok(normalized.includes("|==="), "Missing table delimiters");
		assert.ok(normalized.includes("|H1 |H2"), "Missing header content");
		assert.ok(normalized.includes("|V1 |V2"), "Missing row content");
	});
});
