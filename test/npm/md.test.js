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

describe("NPM: Markdown to AsciiDoc", () => {
	test("should convert Markdown string to AsciiDoc", async () => {
		const mdContent = "# Title\n\n## Section\n\n**Bold** and *Italic*";
		const tempFile = writeTempFile(".md", mdContent);
		const content = await convert({ input: tempFile });

		assert.ok(content.includes("= Title"), "Missing level 1 header");
		assert.ok(content.includes("== Section"), "Missing level 2 header");
		assert.ok(content.includes("*Bold*"), "Missing bold");
		assert.ok(content.includes("_Italic_"), "Missing italic");
	});

	test("should convert raw markdown strings directly", async () => {
		const content = await convert({ inputString: "# Title\n\n**Bold** text", fromFormat: "md" });

		assert.ok(content.includes("= Title"), "Missing level 1 header from inputString input");
		assert.ok(content.includes("*Bold*"), "Missing bold from inputString input");
	});

	test("should convert typed buffers directly", async () => {
		const inputBuffer = Buffer.from("# Title\n\n- item one\n- item two");
		const content = await convert({ inputBuffer, fromFormat: "md" });

		assert.ok(content.includes("= Title"), "Missing level 1 header from inputBuffer input");
		assert.ok(content.includes("item one"), "Missing list item from inputBuffer input");
	});

	test("should reject multiple input sources", async () => {
		await assert.rejects(async () => {
			await convert({ inputFilePath: "./README.md", inputString: "# Title" });
		}, /Exactly one input source/);
	});

	test("should convert Markdown via the public convert API", async () => {
		const mdContent = "# Title\n\n## Section\n\n**Bold** and *Italic*";
		const tempFile = writeTempFile(".md", mdContent);
		const content = await convert({ input: tempFile });

		assert.ok(content.includes("= Title"), "Missing level 1 header");
		assert.ok(content.includes("== Section"), "Missing level 2 header");
	});

	test("should protect code blocks during conversion", async () => {
		const mdContent = "```javascript\nconst x = 1;\n```";
		const tempFile = writeTempFile(".md", mdContent);
		const content = await convert({ input: tempFile });

		assert.ok(content.includes("[source,javascript]"), "Missing source block header");
		assert.ok(content.includes("----"), "Missing delimiters");
		assert.ok(content.includes("const x = 1;"), "Missing code content");
	});
});
