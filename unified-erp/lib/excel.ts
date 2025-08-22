import { Workbook } from 'exceljs';

/**
 * Creates an Excel buffer from data.
 * @param columns An array of column headers.
 * @param data An array of data objects.
 * @param sheetName The name of the worksheet.
 * @returns A Promise that resolves with the Excel file buffer.
 */
export async function generateExcel(columns: any[], data: any[], sheetName: string = 'Sheet 1'): Promise<Buffer> {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Set RTL properties for the worksheet
  worksheet.views = [
    { rightToLeft: true }
  ];

  // Add columns to the worksheet
  worksheet.columns = columns;

  // Style the header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 14 };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }, // Light Grey
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });


  // Add data rows
  worksheet.addRows(data);

  // Style data rows
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'right' };
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    }
  });

  // Adjust column widths
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, (cell) => {
      let columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 12 ? 12 : maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}

/**
 * Prepares data and columns for the Installments Excel report.
 * @param data An array of installment data.
 * @returns An object containing columns and formatted data rows.
 */
export function prepareInstallmentsReportExcel(data: any[]) {
    const columns = [
        { header: 'رقم العقد', key: 'contractId', width: 25 },
        { header: 'تاريخ الاستحقاق', key: 'dueDate', width: 20 },
        { header: 'الحالة', key: 'status', width: 15 },
        { header: 'المبلغ', key: 'amount', width: 20 },
    ];

    const rows = data.map(inst => ({
        contractId: inst.contractId,
        dueDate: new Date(inst.dueDate).toLocaleDateString('ar-EG'),
        status: inst.status, // Assuming status is in Arabic or needs mapping
        amount: {
            // Formula to display as number with formatting
            result: inst.amount,
            formula: undefined,
        },
    }));

    // Apply number format to the amount column
    const amountCol = 'D'; // Assuming Amount is the 4th column
    rows.forEach((row, index) => {
        const cell = `D${index + 2}`;
        // This is a placeholder as direct number formatting is part of styling
    });


    return { columns, rows };
}
