import assert from "node:assert";
import { describe, test } from "node:test";
import { convert } from "../../dist/index.js";

describe("NPM: MediaWiki to AsciiDoc", () => {
	test("should convert sample.wiki to AsciiDoc via the public API", async () => {
		const wikiPath = "test/docs/sample.wiki";
		const content = await convert({ input: wikiPath });

		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
		assert.ok(content.includes("John Doe"), "Missing author");
	});
});
