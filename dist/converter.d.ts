export declare function getAdocContent(inputFile: string, ext: string): Promise<string>;
export interface ConvertOptions {
    input: string;
    type?: string | "markdown" | "md" | "text" | "txt";
}
export declare function convert(options: ConvertOptions): Promise<string>;
