import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

/**
 * Converts PDF buffer to AsciiDoc text, with OCR fallback for scanned pages.
 */
export async function convertPdfToAdoc(
	buffer: Buffer,
	options: { enableOcr?: boolean; lang?: string; maxOcrPages?: number } = { enableOcr: true, lang: "eng" },
): Promise<string> {
	let parser: PDFParse | null = null;
	try {
		parser = new PDFParse({ data: buffer });
		const info = await parser.getInfo();
		const title = info.info?.Title?.trim();
		const result = await parser.getText();
		const extractedText = result.text?.trim() ?? "";
		if (extractedText.length > 0 || options.enableOcr === false) {
			const text = result.text ?? "";
			return title ? `= ${title}\n\n${text}` : text;
		}
		// Fallback OCR for scanned/non-textual PDF pages using the same parser instance
		const screenshots = await parser.getScreenshot();
		if (!screenshots?.pages || screenshots.pages.length === 0) {
			const text = result.text ?? "";
			return title ? `= ${title}\n\n${text}` : text;
		}
		let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
		try {
			worker = await createWorker(options.lang || "eng");
			const pageTexts: string[] = [];
			const maxPages = options.maxOcrPages && options.maxOcrPages > 0 ? options.maxOcrPages : screenshots.pages.length;
			const pagesToProcess = screenshots.pages.slice(0, maxPages);
			for (const page of pagesToProcess) {
				if (page.data) {
					const pageImg = Buffer.from(page.data);
					// Clear buffer from page object immediately to free memory on multi-page documents
					// biome-ignore lint/suspicious/noExplicitAny: Memory cleanup
					(page as any).data = null;
					const res = await worker.recognize(pageImg);
					if (res.data.text?.trim()) {
						pageTexts.push(res.data.text.trim());
					}
				}
			}
			const ocrText = pageTexts.join("\n\n");
			if (title) {
				return `= ${title}\n\n${ocrText}`;
			}
			return ocrText;
		} finally {
			if (worker) {
				await worker.terminate();
			}
		}
	} finally {
		if (parser && typeof parser.destroy === "function") {
			try {
				await parser.destroy();
			} catch {
				// ignore destruction error
			}
		}
	}
}
