import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: RTF to AsciiDoc", () => {
	const rtfPath = "test/docs/sample.rtf";
	const outputPath = "test/output/sample_rtf.adoc";

	test("should convert sample.rtf to AsciiDoc via CLI", () => {
		try {
			const result = runCLI([rtfPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			// Verification based on sample.rtf content
			assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
			assert.ok(content.includes("Document Metadata"), "Missing section header fragment");
			assert.ok(content.includes("John Doe"), "Missing author");
			assert.ok(content.includes("Abstract Block"), "Missing abstract block");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
