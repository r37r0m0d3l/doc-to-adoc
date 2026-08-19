import { createWorker } from "tesseract.js";

/**
 * Recognizes text from image data using OCR (Tesseract.js).
 */
export async function recognizeImage(image: Buffer | Uint8Array | string, lang = "eng"): Promise<string> {
	const worker = await createWorker(lang);
	try {
		// biome-ignore lint/suspicious/noExplicitAny: Tesseract image type
		const ret = await worker.recognize(image as any);
		return ret.data.text;
	} finally {
		await worker.terminate();
	}
}

/**
 * Converts image file/buffer to AsciiDoc text using OCR.
 */
export async function convertImageToAdoc(image: Buffer | Uint8Array | string, lang = "eng"): Promise<string> {
	const text = await recognizeImage(image, lang);
	return text.trim();
}
