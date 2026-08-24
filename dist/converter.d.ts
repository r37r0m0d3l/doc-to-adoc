export interface ConvertOptions {
    inputFilePath?: string | Buffer | URL;
    inputString?: string;
    inputBuffer?: Buffer | Uint8Array;
    fromFormat?: string;
    toFormat?: string | "markdown" | "md" | "text" | "txt";
}
export declare function convert(options: ConvertOptions): Promise<string>;
