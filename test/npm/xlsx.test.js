import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import ExcelJS from "exceljs";
import { convert } from "../../dist/index.js";

function writeWorkbookToTempFile(workbook) {
	const filePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "doc-to-adoc-")), "sample.xlsx");
	return workbook.xlsx.writeFile(filePath).then(() => filePath);
}

describe("NPM: XLSX to AsciiDoc & Table Extraction", () => {
	test("should convert basic XLSX workbook to AsciiDoc table", async () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sheet1");
		ws.addRow(["Name", "Age", "City"]);
		ws.addRow(["Alice", 30, "New York"]);
		ws.addRow(["Bob", 25, "Los Angeles"]);
		const filePath = await writeWorkbookToTempFile(wb);

		const result = await convert({ input: filePath });

		assert.ok(result.includes('[options="header"]'), "Missing table header option");
		assert.ok(result.includes("| Name | Age | City"), "Missing header row");
		assert.ok(result.includes("| Alice | 30 | New York"), "Missing first row");
		assert.ok(result.includes("| Bob | 25 | Los Angeles"), "Missing second row");
	});

	test("should convert merged-cell worksheets through the public API", async () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sheet1");
		ws.addRow(["Full Name", "", "Age"]);
		ws.addRow(["John", "Doe", 30]);
		ws.mergeCells("A1:B1");
		const filePath = await writeWorkbookToTempFile(wb);

		const adoc = await convert({ input: filePath });
		assert.ok(adoc.includes("2+| Full Name | Age"), "AsciiDoc should have 2+| colspan prefix");
	});

	test("should convert worksheets to Markdown using the public API", async () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sheet1");
		ws.addRow(["Product", "Qty", "Price"]);
		ws.addRow(["Widget", 10, 100]);
		const filePath = await writeWorkbookToTempFile(wb);

		const md = await convert({ input: filePath, type: "markdown" });
		assert.ok(md.includes("| Product | Qty | Price |"), "Worksheet markdown should contain headers");
	});
});
