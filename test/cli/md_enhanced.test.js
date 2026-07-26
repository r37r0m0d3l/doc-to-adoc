import assert from "node:assert";
import * as fs from "node:fs";
import { after, before, describe, test } from "node:test";
import { runCLI } from "./cli_helper.js";

describe("CLI: Enhanced Markdown Conversion", () => {
	const testInput = "test/docs/complex_markdown.md";
	const outputPath = "test/output/complex_markdown.adoc";

	before(() => {
		if (!fs.existsSync("test/output")) {
			fs.mkdirSync("test/output", { recursive: true });
		}
		fs.writeFileSync(
			testInput,
			`
# Complex Markdown

- List Item 1
- List Item 2

1. Ordered 1
2. Ordered 2

> Blockquote line 1
> Blockquote line 2

| Col 1 | Col 2 |
|-------|-------|
| Val 1 | Val 2 |

---

![Alt](img.png)
[Link](http://example.com)
        `.trim(),
		);
	});

	after(() => {
		if (fs.existsSync(testInput)) fs.unlinkSync(testInput);
	});

	test("should convert complex markdown via CLI", () => {
		const result = runCLI([testInput, outputPath]);
		assert.strictEqual(result.status, 0);
		assert.ok(fs.existsSync(outputPath), "Output should be created");

		const content = fs.readFileSync(outputPath, "utf-8");
		assert.ok(content.includes("Complex Markdown"));
		assert.ok(content.includes("List Item 1"));
		assert.ok(content.includes("Ordered 1"));
		assert.ok(content.includes("____"), "Should contain blockquote delimiters");
		assert.ok(content.includes("|==="), "Should contain table delimiters");
		assert.ok(content.includes("'''"), "Should contain horizontal rule");
		assert.ok(content.includes("image:img.png[Alt]"));
		assert.ok(content.includes("http://example.com[Link]"));
	});
});
