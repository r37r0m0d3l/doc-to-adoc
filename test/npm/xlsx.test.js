import assert from "node:assert";
import { describe, test } from "node:test";
import ExcelJS from "exceljs";
import { convertSpreadsheetToAdoc, worksheetToAdoc, worksheetToHtmlTable, worksheetToMarkdown } from "../../dist/index.js";

describe("NPM: XLSX to AsciiDoc & Table Extraction", () => {
	test("should convert basic XLSX buffer to AsciiDoc table", async () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sheet1");
		ws.addRow(["Name", "Age", "City"]);
		ws.addRow(["Alice", 30, "New York"]);
		ws.addRow(["Bob", 25, "Los Angeles"]);
		const buffer = Buffer.from(await wb.xlsx.writeBuffer());

		const result = await convertSpreadsheetToAdoc(buffer);

		const expectedAdoc = `[options="header"]
|===
| Name | Age | City

| Alice | 30 | New York
| Bob | 25 | Los Angeles
|===
`;
		assert.strictEqual(result, expectedAdoc);
	});

	test("should handle colspan merged cells in AsciiDoc and HTML", async () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sheet1");
		ws.addRow(["Full Name", "", "Age"]);
		ws.addRow(["John", "Doe", 30]);
		ws.mergeCells("A1:B1");

		const adoc = worksheetToAdoc(ws);
		assert.ok(adoc.includes("2+| Full Name | Age"), "AsciiDoc should have 2+| colspan prefix");

		const html = worksheetToHtmlTable(ws);
		assert.ok(html.includes('<th colspan="2">Full Name</th>'), "HTML should have colspan=2 attribute");
	});

	test("should handle rowspan merged cells in AsciiDoc and HTML", async () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sheet1");
		ws.addRow(["Category", "Item", "Price"]);
		ws.addRow(["Fruit", "Apple", "$1"]);
		ws.addRow(["", "Banana", "$2"]);
		ws.mergeCells("A2:A3");

		const adoc = worksheetToAdoc(ws);
		assert.ok(adoc.includes(".2+| Fruit | Apple | $1"), "AsciiDoc should have .2+| rowspan prefix");

		const html = worksheetToHtmlTable(ws);
		assert.ok(html.includes('<td rowspan="2">Fruit</td>'), "HTML should have rowspan=2 attribute");
	});

	test("should handle 2D merged cells (colspan and rowspan)", async () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sheet1");
		ws.addRow(["Combined Header", "", "Other"]);
		ws.addRow(["", "", "Value 1"]);
		ws.addRow(["Row 3", "Col 2", "Value 2"]);
		ws.mergeCells("A1:B2");

		const adoc = worksheetToAdoc(ws);
		assert.ok(adoc.includes("2.2+| Combined Header | Other"), "AsciiDoc should have 2.2+| prefix");

		const html = worksheetToHtmlTable(ws);
		assert.ok(html.includes('<th colspan="2" rowspan="2">Combined Header</th>'), "HTML should have colspan and rowspan");
	});

	test("should convert worksheets to clean GFM Markdown", async () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sheet1");
		ws.addRow(["Product", "Qty", "Price"]);
		ws.addRow(["Widget", 10, 100]);

		const wsMd = worksheetToMarkdown(ws);
		assert.ok(wsMd.includes("| Product | Qty | Price |"), "Worksheet markdown should contain headers");

		const html = worksheetToHtmlTable(ws);
		assert.ok(html.includes("<table>"), "HTML should contain table tag");
		assert.ok(html.includes("<th>Product</th>"), "HTML should contain th");
	});
});
