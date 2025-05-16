import ReactDOMServer from 'react-dom/server';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun } from "docx";
function renderJSXToHTML(jsx) {
    return ReactDOMServer.renderToStaticMarkup(jsx);
}
function wrapWithHTML(htmlContent, customCSS = '') {
    // Includes Tailwind CDN link + optional custom CSS
    return `
    <html>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.2/dist/tailwind.min.css" rel="stylesheet" />
        <style>${customCSS}</style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `;
}
export async function convertToPDF(jsx, options = {}) {
    const html = renderJSXToHTML(jsx);
    const wrappedHTML = wrapWithHTML(html, options.customCSS);
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = options.width || '210mm'; // A4 width
    container.innerHTML = wrappedHTML;
    document.body.appendChild(container);
    const canvas = await html2canvas(container, { scale: options.scale || 2 });
    document.body.removeChild(container);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('blob');
}
// export function convertToDOC(
//   jsx: React.ReactNode,
//   options: ConvertOptions = {}
// ): Blob {
//   const html = renderJSXToHTML(jsx);
//   const wrappedHTML = wrapWithHTML(html, options.customCSS);
//   const docxBlob = new Blob([htmlDocx.asBlob(wrappedHTML)], {
//     type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   });
//   return docxBlob;
// }
// import { Document, Packer, Paragraph, TextRun } from "docx";
export async function convertToDOC(jsx, options = {}) {
    // Convert JSX to plain text by stripping HTML tags
    const htmlString = renderJSXToHTML(jsx);
    // Simple helper to strip tags (you may want a better HTML-to-text solution)
    const plainText = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        children: [new TextRun(plainText)],
                    }),
                ],
            },
        ],
    });
    const buffer = await Packer.toBuffer(doc);
    return new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
}
function dataURLToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--)
        u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
}
export async function convertToImage(jsx, options = {}) {
    const format = options.format || 'png';
    const html = renderJSXToHTML(jsx);
    const wrappedHTML = wrapWithHTML(html, options.customCSS);
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = options.width || '800px';
    container.innerHTML = wrappedHTML;
    document.body.appendChild(container);
    const canvas = await html2canvas(container, { scale: options.scale || 2 });
    document.body.removeChild(container);
    let blob;
    if (format === 'jpg' || format === 'jpeg') {
        const dataUrl = canvas.toDataURL('image/jpeg');
        blob = dataURLToBlob(dataUrl);
    }
    else {
        const dataUrl = canvas.toDataURL('image/png');
        blob = dataURLToBlob(dataUrl);
    }
    return blob;
}
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
