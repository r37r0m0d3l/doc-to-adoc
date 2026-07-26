import assert from "node:assert";
import { describe, test } from "node:test";
import { convertStructuredDataToAdoc } from "../../bin/converter.js";

describe("NPM: XML to AsciiDoc", () => {
	test("should convert XML to AsciiDoc tree", () => {
		const xmlContent = `
<user id="123">
    <name>Alice</name>
    <role>Admin</role>
</user>
    `.trim();

		const result = convertStructuredDataToAdoc(xmlContent, "xml");

		assert.ok(result.includes("* *user:*"), "Missing user header");
		assert.ok(result.includes("** *@_id:* 123"), "Missing attribute id");
		assert.ok(result.includes("** *name:* Alice"), "Missing name");
		assert.ok(result.includes("** *role:* Admin"), "Missing role");
	});
});
