#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { convert } from "./index.js";

async function run(): Promise<void> {
	const { values, positionals } = parseArgs({
		options: {
			input: { type: "string", short: "i" },
			output: { type: "string", short: "o" },
			type: { type: "string", short: "t", default: "adoc" },
			force: { type: "boolean", short: "f", default: false },
			version: { type: "boolean", short: "v" },
			help: { type: "boolean", short: "h" },
		},
		allowPositionals: true,
	});

	if (values.version) {
		console.log("2adoc v1.0.0");
		process.exit(0);
	}

	if (values.help) {
		console.log(
			`
2adoc – Universal Document & Data to AsciiDoc Converter

Usage:
  2adoc <input-file> [output-file] [options]
  2adoc -i <input-file> -o <output-file> -t <type>

Options:
  -i, --input <file>   Input file path
  -o, --output <file>  Output file path (default: stdout)
  -t, --type <type>    Output format: adoc, md, txt (default: adoc)
  -f, --force          Overwrite output files if it already exists
  -v, --version        Show version
  -h, --help           Show help
    `.trim(),
		);
		process.exit(0);
	}

	const inputFile = values.input || positionals[0];
	const outputFile = values.output || positionals[1];

	if (!inputFile) {
		console.error("Error: Missing input file. Run '2adoc --help' for usage.");
		process.exit(1);
	}

	const outputType = (values.type || "adoc").toLowerCase();
	if (!["adoc", "asciidoc", "md", "markdown", "txt", "text"].includes(outputType)) {
		console.error(`Error: Unsupported output type '${outputType}'. Valid types: adoc, md, txt.`);
		process.exit(1);
	}

	try {
		const result = await convert({
			input: inputFile,
			type: outputType as "adoc" | "md" | "txt",
		});

		if (outputFile) {
			if (!values.force) {
				try {
					await fs.access(outputFile);
					console.error(`Error: Output file '${outputFile}' already exists. Use -f or --force to overwrite.`);
					process.exit(1);
				} catch (error: unknown) {
					// File does not exist, proceed with writing
					if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
						throw error;
					}
				}
			}

			await fs.mkdir(path.dirname(path.resolve(outputFile)), { recursive: true });
			await fs.writeFile(outputFile, result, "utf-8");
		} else {
			process.stdout.write(result);
		}
	} catch (error: unknown) {
		console.error("Conversion failed:", error instanceof Error ? error.message : error);
		process.exit(2);
	}
}

run()
	.then(() => process.exit(0))
	.catch((error: unknown) => {
		console.error(error);
		process.exit(3);
	});
