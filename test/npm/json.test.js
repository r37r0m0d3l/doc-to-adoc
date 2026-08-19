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

describe("NPM: JSON to AsciiDoc", () => {
	test("should convert JSON to AsciiDoc tree", async () => {
		const jsonContent = JSON.stringify({
			name: "Alice",
			age: 30,
			address: {
				city: "New York",
				zip: "10001",
			},
		});
		const tempFile = writeTempFile(".json", jsonContent);
		const result = await convert({ input: tempFile });

		assert.ok(result.includes("* *name:* Alice"), "Missing name");
		assert.ok(result.includes("* *age:* 30"), "Missing age");
		assert.ok(result.includes("* *address:*"), "Missing address header");
		assert.ok(result.includes("** *city:* New York"), "Missing city");
		assert.ok(result.includes("** *zip:* 10001"), "Missing zip");
	});
});
