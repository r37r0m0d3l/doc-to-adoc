import ExcelJS from "exceljs";
export declare function getExcelCellText(cell: ExcelJS.Cell): string;
export interface CellMergeInfo {
    rowspan: number;
    colspan: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export declare function parseCellAddress(address: string): {
    row: number;
    col: number;
};
export declare function getWorksheetMerges(worksheet: ExcelJS.Worksheet): {
    merges: Map<string, CellMergeInfo>;
    coveredCells: Set<string>;
};
export declare function worksheetToHtmlTable(worksheet: ExcelJS.Worksheet): string;
export declare function worksheetToMarkdown(worksheet: ExcelJS.Worksheet): string;
export declare function worksheetToAdoc(worksheet: ExcelJS.Worksheet): string;
export declare function convertSpreadsheetToAdoc(buffer: Buffer): Promise<string>;
