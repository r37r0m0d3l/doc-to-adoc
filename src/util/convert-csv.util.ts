import { parse as parseCsv } from "csv-parse/sync";

/**
 * Converts CSV/TSV formatted tabular text into an AsciiDoc table.
 */
export function convertCsvToAdoc(content: string, delimiter = ","): string {
	const records: string[][] = parseCsv(content, { skip_empty_lines: true, delimiter });
	if (records.length === 0) {
		return "";
	}
	const headers = records[0];
	const rows = records.slice(1);
	let adoc = '[options="header"]\n|===\n';
	adoc += `| ${headers.map((h) => String(h).replace(/\|/g, "\\|")).join(" | ")}\n\n`;
	for (const row of rows) {
		adoc += `| ${row.map((cell) => String(cell).replace(/\|/g, "\\|")).join(" | ")}\n`;
	}
	adoc += "|===\n";
	return adoc;
}
