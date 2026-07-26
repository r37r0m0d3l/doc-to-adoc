import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: ODT to AsciiDoc", () => {
	const odtPath = "test/docs/sample.odt";
	const outputPath = "test/output/sample_odt.adoc";

	test("should convert sample.odt to AsciiDoc via CLI", () => {
		try {
			const result = runCLI([odtPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			// Verification based on sample.odt content
			assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
			assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
			assert.ok(content.includes("John Doe"), "Missing author");
			assert.ok(content.includes("Abstract Block"), "Missing abstract block");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
