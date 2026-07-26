import assert from "node:assert";
import fs from "node:fs";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: JSON to AsciiDoc", () => {
	const jsonPath = "test/docs/sample.json";
	const outputPath = "test/output/sample_json.adoc";

	test("should convert sample.json to AsciiDoc tree via CLI", () => {
		const jsonContent = fs.readFileSync(jsonPath, "utf-8");
		const data = JSON.parse(jsonContent);

		try {
			const result = runCLI([jsonPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			// sample.json is an array of objects.
			for (let i = 0; i < data.length; i++) {
				const record = data[i];
				assert.ok(content.includes(`* *${i}:*`), `Missing index ${i}`);
				assert.ok(content.includes(`** *first_name:* ${record.first_name}`), `Missing first_name for index ${i}`);
				assert.ok(content.includes(`** *email:* ${record.email}`), `Missing email for index ${i}`);
			}
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
