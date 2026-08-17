import assert from "node:assert";
import { describe, test } from "node:test";
import { getAdocContent } from "../../dist/index.js";

describe("NPM: MediaWiki to AsciiDoc (via getAdocContent)", () => {
	test("should convert sample.wiki to AsciiDoc", async () => {
		const wikiPath = "test/docs/sample.wiki";
		const content = await getAdocContent(wikiPath, ".wiki");

		// Depending on Pandoc availability, this might use Pandoc or fallback
		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
		assert.ok(content.includes("John Doe"), "Missing author");
	});
});
