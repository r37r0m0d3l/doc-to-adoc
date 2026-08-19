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

describe("NPM: HTML to AsciiDoc", () => {
	test("should convert basic HTML to AsciiDoc", async () => {
		const htmlContent = `
        <h1>Main Title</h1>
        <p>This is a <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    `;
		const tempFile = writeTempFile(".html", htmlContent);
		const result = await convert({ input: tempFile });

		assert.ok(result.includes("= Main Title"), "Missing main title");
		assert.ok(result.includes("*bold*"), "Missing bold text");
		assert.ok(result.includes("_italic_"), "Missing italic text");
		assert.ok(result.includes("Item 1"), "Missing list item 1");
		assert.ok(result.includes("Item 2"), "Missing list item 2");
	});
});
