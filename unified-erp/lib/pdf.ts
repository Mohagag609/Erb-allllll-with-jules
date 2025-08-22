/**
 * Note: This service requires font files to be available in the project.
 * For example, in a `/public/fonts` directory.
 * We will assume 'Amiri-Regular.ttf' and 'Amiri-Bold.ttf' exist.
 * The vfs_fonts.js file from pdfmake is also a prerequisite.
 */
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// This is the virtual file system for pdfmake.
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Define Arabic fonts. The actual font files must be loaded into the VFS.
// This is a configuration step that typically happens once in an application's setup.
// For a server-side environment, you would load the font files from the filesystem.
pdfMake.fonts = {
  Amiri: {
    normal: 'Amiri-Regular.ttf',
    bold: 'Amiri-Bold.ttf',
    italics: 'Amiri-Regular.ttf',
    bolditalics: 'Amiri-Bold.ttf'
  },
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Bold.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-Bold.ttf'
  }
};

/**
 * Generates a PDF buffer from a document definition.
 * @param docDefinition The pdfmake document definition.
 * @returns A Promise that resolves with the PDF buffer.
 */
export async function generatePdf(docDefinition: TDocumentDefinitions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
}

/**
 * Creates a document definition for an installments report.
 * @param data An array of installment data.
 * @returns A pdfmake document definition object.
 */
export function createInstallmentsReportDocDefinition(data: any[]): TDocumentDefinitions {
    const body = [
        // Table header - right to left
        [{ text: 'المبلغ', style: 'tableHeader' }, { text: 'الحالة', style: 'tableHeader' }, { text: 'تاريخ الاستحقاق', style: 'tableHeader' }, { text: 'رقم العقد', style: 'tableHeader' }]
    ];

    data.forEach(inst => {
        body.push([
            new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(inst.amount),
            inst.status, // Assuming status is in Arabic or needs mapping
            new Date(inst.dueDate).toLocaleDateString('ar-EG'),
            inst.contractId.substring(0, 10) + '...'
        ]);
    });

    const docDefinition: TDocumentDefinitions = {
        content: [
            { text: 'تقرير الأقساط الشهرية', style: 'header' },
            {
                style: 'tableStyle',
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', '*'],
                    body: body
                },
                // RTL layout for the table
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 2 : 1,
                    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 2 : 1,
                    // Bidi-ordering for columns - this is important for RTL
                    bidiLevel: 1,
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
                alignment: 'center'
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black',
                alignment: 'center',
                margin: [0, 5, 0, 5]
            },
            tableStyle: {
                margin: [0, 5, 0, 15]
            },
        },
        defaultStyle: {
            font: 'Amiri', // Use our defined Arabic font
            alignment: 'right' // Default alignment for all text
        }
    };
    return docDefinition;
}
