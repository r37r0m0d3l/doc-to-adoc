import assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, test } from "node:test";
import { convert } from "../../bin/converter.js";

describe("NPM: Text Extraction", () => {
	const tableAdoc = `
= Document Title

[options="header"]
|===
| Header 1 | Header 2
| Cell 1.1 | Cell 1.2
| Cell 2.1 | Cell 2.2
|===

Some paragraph text.

* List item 1
* List item 2
    `.trim();

	test("should extract clean text from AsciiDoc with tables and lists", async () => {
		const tempFile = path.resolve(process.cwd(), "test/docs/temp_table.adoc");
		fs.writeFileSync(tempFile, tableAdoc);

		const text = await convert({ input: tempFile, type: "txt" });
		fs.unlinkSync(tempFile);

		assert.ok(text.includes("Header 1 | Header 2"), "Missing table headers in text");
		assert.ok(text.includes("Cell 1.1 | Cell 1.2"), "Missing table cells in text");
		assert.ok(text.includes("* List item 1"), "Missing list items in text");
		assert.ok(!text.includes("|==="), "Delimiters should be removed");
	});
});
