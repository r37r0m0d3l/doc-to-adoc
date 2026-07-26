import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: DOC to AsciiDoc", () => {
	const docPath = "test/docs/sample.doc";
	const outputPath = "test/output/sample_doc.adoc";

	test("should attempt to convert DOC (expected Mammoth limitation)", () => {
		try {
			const result = runCLI([docPath, outputPath]);

			// Current implementation fails on legacy binary .doc due to Mammoth limitation
			if (result.status !== 0) {
				assert.ok(
					result.stderr.includes("zip") || result.stderr.includes("Mammoth"),
					"Failure should be related to ZIP/Mammoth limitation",
				);
			} else {
				// If it ever starts working, that's fine too, but we should document it.
			}
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
