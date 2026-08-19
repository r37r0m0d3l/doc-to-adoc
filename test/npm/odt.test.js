import assert from "node:assert";
import { describe, test } from "node:test";
import { convertOdtToAdoc, getAdocContent } from "../../dist/index.js";

describe("NPM: ODT to AsciiDoc (via getAdocContent and convertOdtToAdoc)", () => {
	test("should convert sample.odt to AsciiDoc via getAdocContent", async () => {
		const odtPath = "test/docs/sample.odt";
		const content = await getAdocContent(odtPath, ".odt");

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
	});

	test("should convert sample.odt to AsciiDoc via convertOdtToAdoc", async () => {
		const odtPath = "test/docs/sample.odt";
		const content = await convertOdtToAdoc(odtPath);

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
	});
});
