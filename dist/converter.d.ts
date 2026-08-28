export type FormatsType = "adoc" | "asciidoc" | "markdown" | "md" | "text" | "txt";
export interface ConvertOptions {
    inputFilePath?: string | Buffer | URL;
    inputString?: string;
    inputBuffer?: Buffer | Uint8Array;
    fromFormat?: string;
    toFormat?: FormatsType;
}
export declare function convert(options: ConvertOptions): Promise<string>;
