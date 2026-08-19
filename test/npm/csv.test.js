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

describe("NPM: CSV to AsciiDoc", () => {
	test("should convert basic CSV to AsciiDoc table", async () => {
		const csvContent = "name,age,city\nAlice,30,New York\nBob,25,Los Angeles";
		const tempFile = writeTempFile(".csv", csvContent);
		const result = await convert({ input: tempFile });

		assert.ok(result.includes('[options="header"]'), "Missing table header option");
		assert.ok(result.includes("| name | age | city"), "Missing CSV header row");
		assert.ok(result.includes("| Alice | 30 | New York"), "Missing first CSV row");
		assert.ok(result.includes("| Bob | 25 | Los Angeles"), "Missing second CSV row");
	});

	test("should escape pipe characters in CSV content", async () => {
		const csvContent = 'name,description\nItem 1,"Description with | pipe"';
		const tempFile = writeTempFile(".csv", csvContent);
		const result = await convert({ input: tempFile });

		assert.ok(result.includes("Description with \\| pipe"), "Missing escaped pipe");
		assert.ok(result.includes("| Item 1 | Description with \\| pipe"), "Missing escaped pipe row");
	});
});
