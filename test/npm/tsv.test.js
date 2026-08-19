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

describe("NPM: TSV to AsciiDoc", () => {
	test("should convert TSV to AsciiDoc table", async () => {
		const tsvContent = "name\tage\tcity\nAlice\t30\tNew York\nBob\t25\tLos Angeles";
		const tempFile = writeTempFile(".tsv", tsvContent);
		const result = await convert({ input: tempFile });

		assert.ok(result.includes('[options="header"]'), "Missing table header option");
		assert.ok(result.includes("| name | age | city"), "Missing TSV header row");
		assert.ok(result.includes("| Alice | 30 | New York"), "Missing first TSV row");
		assert.ok(result.includes("| Bob | 25 | Los Angeles"), "Missing second TSV row");
	});
});
