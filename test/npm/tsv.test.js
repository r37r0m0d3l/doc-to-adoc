import assert from "node:assert";
import { describe, test } from "node:test";
import { convertCsvToAdoc } from "../../bin/converter.js";

describe("NPM: TSV to AsciiDoc", () => {
	test("should convert TSV to AsciiDoc table", () => {
		const tsvContent = "name\tage\tcity\nAlice\t30\tNew York\nBob\t25\tLos Angeles";
		const expectedAdoc = `[options="header"]
|===
| name | age | city

| Alice | 30 | New York
| Bob | 25 | Los Angeles
|===
`;
		const result = convertCsvToAdoc(tsvContent, "\t");
		assert.strictEqual(result, expectedAdoc);
	});
});
