import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import pandocPath from "pandoc-binary";

import { isPandocAvailable } from "./pandoc.util.js";

/**
 * Converts ODT (OpenDocument Text) document to AsciiDoc.
 */
export async function convertOdtToAdoc(input: string | Buffer): Promise<string> {
	if (typeof input === "string") {
		if (isPandocAvailable()) {
			const res = spawnSync(pandocPath, ["-f", "odt", input, "-t", "asciidoc"], { encoding: "utf-8" });
			if (res.status === 0 && res.stdout) {
				return res.stdout;
			}
			const retry = spawnSync(pandocPath, [input, "-t", "asciidoc"], { encoding: "utf-8" });
			if (retry.status === 0 && retry.stdout) {
				return retry.stdout;
			}
		}
		const buf = await fs.readFile(input);
		return buf.toString("utf-8");
	}
	if (isPandocAvailable()) {
		const res = spawnSync(pandocPath, ["-f", "odt", "-t", "asciidoc"], { input, encoding: "utf-8" });
		if (res.status === 0 && res.stdout) {
			return res.stdout;
		}
	}
	return input.toString("utf-8");
}
