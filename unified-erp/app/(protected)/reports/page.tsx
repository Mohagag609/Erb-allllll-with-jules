"use client";

import { useState } from "react";
import { getInstallmentsForReport } from "@/services/reporting/installments";
import { createInstallmentsReportDocDefinition, generatePdf } from "@/lib/pdf";
import { generateExcel, prepareInstallmentsReportExcel } from "@/lib/excel";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    setIsLoading(true);
    try {
      const installments = await getInstallmentsForReport({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      if (installments.length === 0) {
        alert("لا توجد بيانات لإنشاء التقرير لهذه الفترة.");
        return;
      }

      let buffer: Buffer;
      let fileName: string;
      let mimeType: string;

      if (format === 'pdf') {
        const docDefinition = createInstallmentsReportDocDefinition(installments);
        // This is a workaround for server-side font loading. In a real app,
        // you would need to load the font file into the vfs.
        // For now, we rely on client-side generation which has the fonts.
        const pdfDoc = require('pdfmake/build/pdfmake').createPdf(docDefinition);

        const blob = await new Promise<Blob>((resolve) => {
            pdfDoc.getBlob((b: Blob) => resolve(b));
        });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');

      } else { // excel
        const { columns, rows } = prepareInstallmentsReportExcel(installments);
        buffer = await generateExcel(columns, rows, "تقرير الأقساط");
        fileName = `Installments_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        const blob = new Blob([buffer], { type: mimeType });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      }

    } catch (error) {
      console.error(`Failed to generate ${format} report:`, error);
      alert(`فشل في إنشاء التقرير. يرجى مراجعة الكونسول.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">مركز التقارير</h1>

      <Card>
        <CardHeader>
          <CardTitle>تقرير الأقساط</CardTitle>
          <CardDescription>إنشاء تقرير بالأقساط المستحقة والمدفوعة خلال فترة محددة.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="start-date">من تاريخ</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">إلى تاريخ</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => handleGenerateReport('pdf')} disabled={isLoading}>
              <Download className="ml-2 h-4 w-4" />
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء PDF'}
            </Button>
            <Button onClick={() => handleGenerateReport('excel')} disabled={isLoading} variant="outline">
              <Download className="ml-2 h-4 w-4" />
              {isLoading ? 'جاري الإنشاء...' : 'تصدير Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
