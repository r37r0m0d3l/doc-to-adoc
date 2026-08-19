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

describe("NPM: XML to AsciiDoc", () => {
	test("should convert XML to AsciiDoc tree", async () => {
		const xmlContent = `
<user id="123">
    <name>Alice</name>
    <role>Admin</role>
</user>
    `.trim();
		const tempFile = writeTempFile(".xml", xmlContent);
		const result = await convert({ input: tempFile });

		assert.ok(result.includes("* *user:*"), "Missing user header");
		assert.ok(result.includes("** *@_id:* 123"), "Missing attribute id");
		assert.ok(result.includes("** *name:* Alice"), "Missing name");
		assert.ok(result.includes("** *role:* Admin"), "Missing role");
	});
});
