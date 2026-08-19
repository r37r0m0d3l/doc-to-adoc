import { spawnSync } from "node:child_process";
import pandocPath from "pandoc-binary";

export function isPandocAvailable(): boolean {
	try {
		const res = spawnSync(pandocPath, ["--version"], { stdio: "ignore" });
		return res.status === 0 && !res.error;
	} catch {
		return false;
	}
}
