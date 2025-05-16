import React from 'react';
type ConvertOptions = {
    width?: string;
    scale?: number;
    customCSS?: string;
};
type ImageFormat = 'png' | 'jpg' | 'jpeg';
export declare function convertToPDF(jsx: React.ReactNode, options?: ConvertOptions): Promise<Blob>;
export declare function convertToDOC(jsx: React.ReactNode, options?: ConvertOptions): Promise<Blob>;
export declare function convertToImage(jsx: React.ReactNode, options?: ConvertOptions & {
    format?: ImageFormat;
}): Promise<Blob>;
export declare function downloadBlob(blob: Blob, filename: string): void;
export {};
