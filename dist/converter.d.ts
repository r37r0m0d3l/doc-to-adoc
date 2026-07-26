export declare const PANDOC_PRIMARY_FORMATS: Record<string, string>;
export declare function isPandocAvailable(): boolean;
export declare function convertPdfToAdoc(buffer: Buffer): Promise<string>;
export declare function convertDocxToAdoc(buffer: Buffer): Promise<string>;
export declare function convertCsvToAdoc(content: string, delimiter?: string): string;
export declare function convertSpreadsheetToAdoc(buffer: Buffer): string;
export declare function convertHtmlToAdoc(content: string): string;
export declare function convertStructuredDataToAdoc(content: unknown, format: "json" | "yaml" | "toml" | "xml"): string;
export declare function objectToAdocTree(obj: Record<string, unknown>, depth?: number): string;
export declare function mdToAdoc(content: string): string;
export declare function convertNativeFallback(inputFile: string, ext: string): Promise<string>;
export declare function getAdocContent(inputFile: string, ext: string): Promise<string>;
export interface ConvertOptions {
    input: string;
    type?: string | "markdown" | "md" | "text" | "txt";
}
export declare function convert(options: ConvertOptions): Promise<string>;
