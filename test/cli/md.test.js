import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: Convert to Markdown", () => {
	test("should convert HTML to Markdown via CLI", () => {
		const htmlPath = "test/docs/sample.html";
		const outputPath = "test/output/sample_html.md";
		try {
			const result = runCLI([htmlPath, outputPath, "-type", "md"]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);
			const content = readOutputFile(outputPath);
			assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title text in Markdown");
			assert.ok(content.includes("##") && content.includes("Document Metadata & Attributes"), "Missing section header in Markdown");
			assert.ok(content.includes("**Bold Text**") || content.includes("__Bold Text__"), "Missing bold text in Markdown");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});

	test("should convert DOCX to Markdown via CLI", () => {
		const docxPath = "test/docs/sample.docx";
		const outputPath = "test/output/sample_docx.md";
		try {
			const result = runCLI([docxPath, outputPath, "-t", "md"]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);
			const content = readOutputFile(outputPath);
			assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header text in Markdown");
			assert.ok(content.includes("##") || content.includes("#"), "Missing some level of header in Markdown");
			assert.ok(content.includes("Basic Styles"), "Missing subsection header text in Markdown");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});

	test("should convert JSON to Markdown via CLI", () => {
		const jsonPath = "test/docs/sample.json";
		const outputPath = "test/output/sample_json.md";
		try {
			const result = runCLI([jsonPath, outputPath, "-type", "md"]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);
			const content = readOutputFile(outputPath);
			assert.ok(content.includes("first") && content.includes("name"), "Missing field first_name in Markdown");
			assert.ok(content.includes("email"), "Missing field email in Markdown");
			assert.ok(content.includes("*") || content.includes("-"), "Missing bullet points in Markdown");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
