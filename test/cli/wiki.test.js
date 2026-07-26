import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: MediaWiki to AsciiDoc", () => {
	const wikiPath = "test/docs/sample.wiki";
	const outputPath = "test/output/sample_wiki.adoc";

	test("should convert sample.wiki to AsciiDoc via CLI", () => {
		try {
			const result = runCLI([wikiPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			// Verification based on sample.wiki content
			assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
			assert.ok(content.includes("John Doe"), "Missing author");
			assert.ok(content.includes("Abstract Block"), "Missing abstract block");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
