import assert from "node:assert";
import fs from "node:fs";

export function readOutputFile(filePath) {
	return fs.readFileSync(filePath, "utf-8");
}

export function cleanupOutputFile(filePath) {
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
}

export function assertTableContent(content, expectedRows) {
	assert.ok(content.includes('[options="header"]'), "Missing header options");
	for (const record of expectedRows) {
		const expectedRow = `| ${record.map((cell) => String(cell).replace(/\|/g, "\\|")).join(" | ")}`;
		assert.ok(content.includes(expectedRow), `Missing row: ${expectedRow}`);
	}
	assert.ok(content.trim().endsWith("|==="), "Missing closing table delimiter");
}
