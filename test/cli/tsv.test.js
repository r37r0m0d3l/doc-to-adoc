import assert from "node:assert";
import fs from "node:fs";
import { describe, test } from "node:test";
import { parse as parseCsv } from "csv-parse/sync";
import { assertTableContent, cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: TSV to AsciiDoc", () => {
	const tsvPath = "test/docs/sample.tsv";
	const outputPath = "test/output/sample_tsv.adoc";

	test("should convert sample.tsv to AsciiDoc table via CLI", () => {
		const tsvContent = fs.readFileSync(tsvPath, "utf-8");
		const records = parseCsv(tsvContent, { skip_empty_lines: true, delimiter: "\t" });

		try {
			const result = runCLI([tsvPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);
			assertTableContent(content, records);
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
