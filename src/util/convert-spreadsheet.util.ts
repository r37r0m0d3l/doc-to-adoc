import ExcelJS from "exceljs";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { escapeHtml } from "./convert-html.util.js";

export function getExcelCellText(cell: ExcelJS.Cell): string {
	const val = cell.value;
	if (val === null || val === undefined) {
		return "";
	}
	if (typeof val === "object") {
		// biome-ignore lint/suspicious/noExplicitAny: ExcelJS complex cell value shapes
		const v = val as any;
		if ("richText" in v && Array.isArray(v.richText)) {
			return v.richText.map((item: { text?: string }) => item.text || "").join("");
		}
		if ("text" in v && typeof v.text === "string") {
			return v.text;
		}
		if ("result" in v && v.result !== undefined) {
			return String(v.result ?? "");
		}
		if ("hyperlink" in v && v.hyperlink) {
			return String(v.text || v.hyperlink);
		}
		if (val instanceof Date) {
			return val.toISOString();
		}
	}
	return String(val);
}

export interface CellMergeInfo {
	rowspan: number;
	colspan: number;
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export function parseCellAddress(address: string): { row: number; col: number } {
	const match = address.match(/^([A-Za-z]+)(\d+)$/);
	if (!match) {
		return { row: 1, col: 1 };
	}
	const colStr = match[1].toUpperCase();
	const row = Number.parseInt(match[2], 10);
	let col = 0;
	for (let index = 0; index < colStr.length; index++) {
		col = col * 26 + (colStr.charCodeAt(index) - 64);
	}
	return { row, col };
}

export function getWorksheetMerges(worksheet: ExcelJS.Worksheet): {
	merges: Map<string, CellMergeInfo>;
	coveredCells: Set<string>;
} {
	const merges = new Map<string, CellMergeInfo>();
	const coveredCells = new Set<string>();
	// biome-ignore lint/suspicious/noExplicitAny: ExcelJS worksheet model typing
	const rawMerges: string[] = (worksheet.model as any)?.merges || [];
	for (const rangeStr of rawMerges) {
		const parts = rangeStr.split(":");
		const start = parseCellAddress(parts[0]);
		const end = parts.length > 1 ? parseCellAddress(parts[1]) : start;
		const top = Math.min(start.row, end.row);
		const bottom = Math.max(start.row, end.row);
		const left = Math.min(start.col, end.col);
		const right = Math.max(start.col, end.col);
		const rowspan = bottom - top + 1;
		const colspan = right - left + 1;
		merges.set(parts[0].toUpperCase(), { rowspan, colspan, top, bottom, left, right });
		for (let r = top; r <= bottom; r++) {
			for (let c = left; c <= right; c++) {
				if (r !== top || c !== left) {
					coveredCells.add(`${r}:${c}`);
				}
			}
		}
	}
	return { merges, coveredCells };
}

export function worksheetToHtmlTable(worksheet: ExcelJS.Worksheet): string {
	const { merges, coveredCells } = getWorksheetMerges(worksheet);
	const rowCount = worksheet.rowCount;
	if (rowCount === 0) {
		return "";
	}
	let maxCol = 0;
	worksheet.eachRow({ includeEmpty: false }, (row) => {
		row.eachCell({ includeEmpty: true }, (_cell, colNumber) => {
			if (colNumber > maxCol) maxCol = colNumber;
		});
	});
	if (maxCol === 0) {
		return "";
	}
	let html = "<table>\n";
	let hasHeader = false;
	for (let r = 1; r <= rowCount; r++) {
		const row = worksheet.getRow(r);
		const isFirstRow = r === 1;
		const tag = isFirstRow ? "th" : "td";
		let rowHtml = "    <tr>\n";
		let hasCells = false;
		for (let c = 1; c <= maxCol; c++) {
			if (coveredCells.has(`${r}:${c}`)) {
				continue;
			}
			hasCells = true;
			const cell = row.getCell(c);
			const text = escapeHtml(getExcelCellText(cell));
			const merge = merges.get(cell.address);
			let attrs = "";
			if (merge) {
				if (merge.colspan > 1) attrs += ` colspan="${merge.colspan}"`;
				if (merge.rowspan > 1) attrs += ` rowspan="${merge.rowspan}"`;
			}
			rowHtml += `      <${tag}${attrs}>${text}</${tag}>\n`;
		}
		rowHtml += "    </tr>\n";
		if (!hasCells) {
			continue;
		}
		if (isFirstRow) {
			html += `  <thead>\n${rowHtml}  </thead>\n  <tbody>\n`;
			hasHeader = true;
		} else {
			html += rowHtml;
		}
	}
	if (hasHeader) {
		html += "  </tbody>\n";
	}
	html += "</table>";
	return html;
}

export function worksheetToMarkdown(worksheet: ExcelJS.Worksheet): string {
	const html = worksheetToHtmlTable(worksheet);
	if (!html) {
		return "";
	}
	const turndownService = new TurndownService({ headingStyle: "atx" });
	turndownService.use(gfm);
	return turndownService.turndown(html);
}

export function worksheetToAdoc(worksheet: ExcelJS.Worksheet): string {
	const { merges, coveredCells } = getWorksheetMerges(worksheet);
	const rowCount = worksheet.rowCount;
	if (rowCount === 0) {
		return "";
	}
	let maxCol = 0;
	worksheet.eachRow({ includeEmpty: false }, (row) => {
		row.eachCell({ includeEmpty: true }, (_cell, colNumber) => {
			if (colNumber > maxCol) maxCol = colNumber;
		});
	});
	if (maxCol === 0) {
		return "";
	}
	let adoc = '[options="header"]\n|===\n';
	for (let r = 1; r <= rowCount; r++) {
		const row = worksheet.getRow(r);
		const cellParts: string[] = [];
		for (let c = 1; c <= maxCol; c++) {
			if (coveredCells.has(`${r}:${c}`)) {
				continue;
			}
			const cell = row.getCell(c);
			const text = getExcelCellText(cell).replace(/\|/g, "\\|");
			const merge = merges.get(cell.address);
			let prefix = "|";
			if (merge) {
				if (merge.colspan > 1 && merge.rowspan > 1) {
					prefix = `${merge.colspan}.${merge.rowspan}+|`;
				} else if (merge.colspan > 1) {
					prefix = `${merge.colspan}+|`;
				} else if (merge.rowspan > 1) {
					prefix = `.${merge.rowspan}+|`;
				}
			}
			cellParts.push(`${prefix} ${text}`);
		}
		if (cellParts.length > 0) {
			adoc += `${cellParts.join(" ")}\n`;
			if (r === 1) {
				adoc += "\n";
			}
		}
	}
	adoc += "|===\n";
	return adoc;
}

/**
 * Converts Excel / Spreadsheet (XLSX, ODS) buffer to AsciiDoc.
 */
export async function convertSpreadsheetToAdoc(buffer: Buffer): Promise<string> {
	const workbook = new ExcelJS.Workbook();
	// biome-ignore lint/suspicious/noExplicitAny: ExcelJS Buffer definition
	await workbook.xlsx.load(buffer as any);
	const sheetsWithData = workbook.worksheets.filter((ws) => ws.rowCount > 0);
	if (sheetsWithData.length === 0) {
		return "";
	}
	if (sheetsWithData.length === 1) {
		return worksheetToAdoc(sheetsWithData[0]);
	}
	return sheetsWithData.map((sheet) => `== ${sheet.name}\n\n${worksheetToAdoc(sheet)}`).join("\n\n");
}
