import { spawnSync } from "node:child_process";
import path from "node:path";

const bin = path.resolve(process.cwd(), "bin/cli.js");

export function runCLI(args) {
	const result = spawnSync("node", [bin, ...args], { encoding: "utf-8" });
	return result;
}
