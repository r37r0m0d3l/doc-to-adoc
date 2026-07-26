import assert from "node:assert";
import fs from "node:fs";
import { describe, test } from "node:test";
import { XMLParser } from "fast-xml-parser";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: XML to AsciiDoc", () => {
	const xmlPath = "test/docs/sample.xml";
	const outputPath = "test/output/sample_xml.adoc";

	test("should convert sample.xml to AsciiDoc tree via CLI", () => {
		const xmlContent = fs.readFileSync(xmlPath, "utf-8");
		const parser = new XMLParser({ ignoreAttributes: false });
		const data = parser.parse(xmlContent);

		try {
			const result = runCLI([xmlPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			// sample.xml structure: <dataset><record>...</record>...</dataset>
			assert.ok(content.includes("* *dataset:*"), "Missing dataset header");
			assert.ok(content.includes("** *record:*"), "Missing record header");

			const records = data.dataset.record;
			for (let i = 0; i < records.length; i++) {
				const record = records[i];
				assert.ok(content.includes(`*** *${i}:*`), `Missing index ${i}`);
				assert.ok(content.includes(`**** *first_name:* ${record.first_name}`), `Missing first_name for index ${i}`);
				assert.ok(content.includes(`**** *email:* ${record.email}`), `Missing email for index ${i}`);
			}
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
