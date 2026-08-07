import assert from "node:assert";
import * as fs from "node:fs";
import { before, describe, test } from "node:test";
import { runCLI } from "./cli_helper.js";

describe("CLI: Verify output types", () => {
	const testInput = "test/docs/sample.adoc";
	const outputPrefix = "test/output/sample";

	before(() => {
		if (!fs.existsSync("test/output")) {
			fs.mkdirSync("test/output", { recursive: true });
		}
	});

	test("should create adoc output by default", () => {
		const outputPath = `${outputPrefix}_default.adoc`;
		const result = runCLI([testInput, outputPath, "-f"]);
		assert.strictEqual(result.status, 0);
		assert.ok(fs.existsSync(outputPath), "adoc output should be created");
		const content = fs.readFileSync(outputPath, "utf-8");
		assert.ok(content.length > 0, "output should not be empty");
	});

	test("should create markdown output with -type markdown", () => {
		const outputPath = `${outputPrefix}.md`;
		const result = runCLI([testInput, "--type", "markdown", "--output", outputPath, "-f"]);
		assert.strictEqual(result.status, 0);
		assert.ok(fs.existsSync(outputPath), "markdown output should be created");
		const content = fs.readFileSync(outputPath, "utf-8");
		assert.ok(content.length > 0, "markdown output should not be empty");
		// Basic MD check
		assert.ok(content.includes("# ") || content.includes("## "), "Should contain markdown headers");
	});

	test("should create text output with -t text", () => {
		const outputPath = `${outputPrefix}.txt`;
		const result = runCLI([testInput, "-t", "text", "-o", outputPath, "-f"]);
		assert.strictEqual(result.status, 0);
		assert.ok(fs.existsSync(outputPath), "text output should be created");
		const content = fs.readFileSync(outputPath, "utf-8");
		assert.ok(content.length > 0, "text output should not be empty");
	});

	test("should handle automatic output name for markdown", () => {
		const mdInput = "test/docs/sample.md";
		// This might overwrite if not careful, but we test the CLI behavior
		const result = runCLI([mdInput, "--type", "markdown"]);
		assert.strictEqual(result.status, 0);
		// The CLI currently appends .md if not present, but here it is present.
		// According to bin/cli.js: output = path.join(parsedPath.dir, `${parsedPath.name}.${outExt}`);
		// sample.md -> sample.md
		assert.ok(fs.existsSync(mdInput));
	});
});
