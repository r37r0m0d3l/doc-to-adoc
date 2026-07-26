import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: HTML to AsciiDoc", () => {
	const htmlPath = "test/docs/sample.html";
	const outputPath = "test/output/sample_html.adoc";

	test("should convert sample.html to AsciiDoc via CLI", () => {
		try {
			const result = runCLI([htmlPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			// Verification based on sample.html content
			assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
			assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
			assert.ok(content.includes("*Bold Text*"), "Missing bold text");
			assert.ok(content.includes("_Italic Text_"), "Missing italic text");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
