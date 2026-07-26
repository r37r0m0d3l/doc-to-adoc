import assert from "node:assert";
import { describe, test } from "node:test";
import { convertHtmlToAdoc } from "../../bin/converter.js";

describe("NPM: HTML to AsciiDoc", () => {
	test("should convert basic HTML to AsciiDoc", () => {
		const htmlContent = `
        <h1>Main Title</h1>
        <p>This is a <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    `;

		const result = convertHtmlToAdoc(htmlContent);

		assert.ok(result.includes("= Main Title"), "Missing main title");
		assert.ok(result.includes("*bold*"), "Missing bold text");
		assert.ok(result.includes("_italic_"), "Missing italic text");
		assert.ok(result.includes("Item 1"), "Missing list item 1");
		assert.ok(result.includes("Item 2"), "Missing list item 2");
	});
});
