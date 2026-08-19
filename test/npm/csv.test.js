import assert from "node:assert";
import { describe, test } from "node:test";
import { convertCsvToAdoc } from "../../dist/index.js";

describe("NPM: CSV to AsciiDoc", () => {
	test("should convert basic CSV to AsciiDoc table", () => {
		const csvContent = "name,age,city\nAlice,30,New York\nBob,25,Los Angeles";
		const expectedAdoc = `[options="header"]
|===
| name | age | city

| Alice | 30 | New York
| Bob | 25 | Los Angeles
|===
`;
		const result = convertCsvToAdoc(csvContent);
		assert.strictEqual(result, expectedAdoc);
	});

	test("should escape pipe characters in CSV content", () => {
		const csvContent = 'name,description\nItem 1,"Description with | pipe"';
		const expectedAdoc = `[options="header"]
|===
| name | description

| Item 1 | Description with \\| pipe
|===
`;
		const result = convertCsvToAdoc(csvContent);
		assert.strictEqual(result, expectedAdoc);
	});
});
