import assert from "node:assert";
import fs from "node:fs";
import { describe, test } from "node:test";
import { parse as parseCsv } from "csv-parse/sync";
import { assertTableContent, cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: CSV to AsciiDoc", () => {
	const csvPath = "test/docs/sample.csv";
	const outputPath = "test/output/sample_csv.adoc";

	test("should convert sample.csv to AsciiDoc table via CLI", () => {
		const csvContent = fs.readFileSync(csvPath, "utf-8");
		const records = parseCsv(csvContent, { skip_empty_lines: true });

		try {
			const result = runCLI([csvPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);
			assertTableContent(content, records);
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
