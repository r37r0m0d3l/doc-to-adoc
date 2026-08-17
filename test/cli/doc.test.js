import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: DOC to AsciiDoc", () => {
	const docPath = "test/docs/sample.doc";
	const outputPath = "test/output/sample_doc.adoc";

	test("should convert DOC to readable AsciiDoc", () => {
		try {
			const result = runCLI([docPath, outputPath]);
			assert.strictEqual(result.status, 0, result.stderr);
			const content = readOutputFile(outputPath);
			assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
			assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
