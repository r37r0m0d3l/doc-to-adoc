import WordExtractor from "word-extractor";

const WORD_BELL_CHARACTER = String.fromCharCode(7);

function normalizeLegacyDocText(text: string): string {
	return text
		.replace(/\r\n?/g, "\n")
		.replaceAll(WORD_BELL_CHARACTER, " ")
		.replace(/[ \t]+\n/g, "\n")
		.split("\n")
		.map((line) => line.trim())
		.filter((line, index, lines) => line.length > 0 || lines[index - 1]?.length > 0)
		.join("\n\n")
		.trim();
}

export async function convertDocToText(input: Buffer | string): Promise<string> {
	const extractor = new WordExtractor();
	const document = await extractor.extract(input);
	const text = normalizeLegacyDocText(document.getBody());

	if (!text) {
		throw new Error("Legacy DOC conversion produced no readable text");
	}

	return text;
}

export async function convertDocToAdoc(input: Buffer | string): Promise<string> {
	return convertDocToText(input);
}
