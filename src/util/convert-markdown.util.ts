/**
 * Converts Markdown string into AsciiDoc format.
 */
export function mdToAdoc(content: string): string {
	const codeBlocks: string[] = [];
	let adoc = content;
	// 1. Protect code blocks
	adoc = adoc.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang: string, code: string) => {
		const placeholder = `§CODEBLOCK${codeBlocks.length}§`;
		codeBlocks.push(`${lang ? `[source,${lang}]\n` : "[source]\n"}----\n${code.trim()}\n----\n`);
		return placeholder;
	});
	// 2. Horizontal Rules (Must be before Bold/Italic to avoid corruption)
	adoc = adoc.replace(/^[*+_-]{3,}$/gm, "'''");
	// 3. Bold & Italic (using placeholders to avoid interference with other rules)
	adoc = adoc.replace(/(\*\*\*|___)(.*?)\1/g, "§BI§$2§BI§"); // Bold-Italic
	adoc = adoc.replace(/(\*\*|__)(.*?)\1/g, "§B§$2§B§"); // Bold
	adoc = adoc.replace(/(\*|_)(.*?)\1/g, "§I§$2§I§"); // Italic
	// 4. Headers (handling optional anchors from Mammoth)
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm, "====== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm, "===== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm, "==== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm, "=== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm, "== $1");
	adoc = adoc.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm, "= $1");
	// 5. Blockquotes
	adoc = adoc.replace(/(?:^[ \t]*>.*(?:\r?\n|$))+/gm, (match) => {
		const rawLines = match.split(/\r?\n/);
		const stripped = rawLines.map((line) => line.replace(/^[ \t]*>\s?/, ""));
		while (stripped.length > 0 && stripped[0].trim() === "") {
			stripped.shift();
		}
		while (stripped.length > 0 && stripped[stripped.length - 1].trim() === "") {
			stripped.pop();
		}
		const lines = stripped.join("\n");
		if (!lines) {
			return "";
		}
		return `[quote]\n____\n${lines}\n____\n\n`;
	});
	// 6. Lists
	// Unordered lists
	adoc = adoc.replace(/^[ \t]*[-*+]\s+(.*)$/gm, "* $1");
	// Ordered lists
	adoc = adoc.replace(/^[ \t]*\d+\.\s+(.*)$/gm, ". $1");
	// 7. Tables (Basic GFM support)
	adoc = adoc.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm, (_match, headerLine, body) => {
		const parseRow = (row: string) =>
			row
				.split("|")
				.filter((_, i, arr) => i > 0 && i < arr.length - 1)
				.map((c) => c.trim());
		const headers = parseRow(headerLine);
		const rows = body.trim().split("\n").map(parseRow);
		let table = '[options="header"]\n|===\n';
		table += `| ${headers.join(" | ")}\n`;
		for (const row of rows) {
			table += `| ${row.join(" | ")}\n`;
		}
		table += "|===\n";
		return table;
	});
	// 8. Images & Links
	// Images first
	// Prevent String.prototype.replace special patterns ($1, $2, $&) in URLs from expanding unexpectedly
	adoc = adoc.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `image:${src}[${alt}]`);
	// Links
	adoc = adoc.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => `${url}[${text}]`);
	// 9. Restore Bold & Italic
	adoc = adoc.replace(/§BI§/g, "***");
	adoc = adoc.replace(/§B§/g, "*");
	adoc = adoc.replace(/§I§/g, "_");
	// 10. Restore code blocks
	codeBlocks.forEach((block, i) => {
		adoc = adoc.replace(`§CODEBLOCK${i}§`, block);
	});
	return adoc.trim();
}

/**
 * Alias for `mdToAdoc`.
 */
export const convertMarkdownToAdoc = mdToAdoc;
