export declare function extractTextFromRtf(source: string): string;
export interface ConvertRtfToAdocOptions {
    usePandoc?: boolean;
}
export declare function convertRtfToAdoc(input: string | Buffer, options?: ConvertRtfToAdocOptions): Promise<string>;
