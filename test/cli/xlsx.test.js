import assert from "node:assert";
import fs from "node:fs";
import { describe, test } from "node:test";
import { utils as excelUtils, read as readExcel } from "xlsx";
import { assertTableContent, cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: XLSX to AsciiDoc", () => {
	const xlsxPath = "test/docs/sample.xlsx";
	const outputPath = "test/output/sample_xlsx.adoc";

	test("should convert sample.xlsx to AsciiDoc table via CLI", () => {
		const buffer = fs.readFileSync(xlsxPath);
		const workbook = readExcel(buffer);
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const records = excelUtils.sheet_to_json(sheet, { header: 1 }).filter((r) => r.length > 0);

		try {
			const result = runCLI([xlsxPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);
			assertTableContent(content, records);
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
