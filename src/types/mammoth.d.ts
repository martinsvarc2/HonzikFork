declare module 'mammoth' {
  interface ConversionOptions {
    styleMap?: string[];
  }
  
  interface ConversionResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer }, 
    options?: ConversionOptions
  ): Promise<ConversionResult>;
}
