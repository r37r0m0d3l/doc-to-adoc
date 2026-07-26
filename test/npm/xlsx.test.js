import assert from "node:assert";
import { describe, test } from "node:test";
import { utils as excelUtils, write as writeExcel } from "xlsx";
import { convertSpreadsheetToAdoc } from "../../bin/converter.js";

describe("NPM: XLSX to AsciiDoc", () => {
	test("should convert XLSX buffer to AsciiDoc table", () => {
		// Create a simple workbook buffer
		const wb = excelUtils.book_new();
		const ws = excelUtils.aoa_to_sheet([
			["Name", "Age", "City"],
			["Alice", 30, "New York"],
			["Bob", 25, "Los Angeles"],
		]);
		excelUtils.book_append_sheet(wb, ws, "Sheet1");
		const buffer = writeExcel(wb, { type: "buffer", bookType: "xlsx" });

		const result = convertSpreadsheetToAdoc(buffer);

		const expectedAdoc = `[options="header"]
|===
| Name | Age | City

| Alice | 30 | New York
| Bob | 25 | Los Angeles
|===
`;
		assert.strictEqual(result, expectedAdoc);
	});
});
