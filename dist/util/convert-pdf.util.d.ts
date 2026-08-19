export declare function convertPdfToAdoc(buffer: Buffer, options?: {
    enableOcr?: boolean;
    lang?: string;
    maxOcrPages?: number;
}): Promise<string>;
