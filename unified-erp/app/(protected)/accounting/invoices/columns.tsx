"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Invoice, InvoiceStatus, InvoiceType, Client, Supplier, Contractor } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"
import { formatCurrency } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { postInvoice } from "@/services/accounting/invoices"
import { toast } from "@/hooks/use-toast"

export type InvoiceWithRelations = Invoice & {
  client: Client | null;
  supplier: Supplier | null;
  contractor: Contractor | null;
};

const statusTextMap: { [key in InvoiceStatus]: string } = {
  [InvoiceStatus.draft]: "مسودة",
  [InvoiceStatus.posted]: "مرحّلة",
  [InvoiceStatus.paid]: "مدفوعة",
  [InvoiceStatus.partial]: "مدفوعة جزئياً",
};

const statusVariantMap: { [key in InvoiceStatus]: "default" | "secondary" | "success" } = {
    [InvoiceStatus.draft]: "default",
    [InvoiceStatus.posted]: "secondary",
    [InvoiceStatus.paid]: "success",
    [InvoiceStatus.partial]: "success",
};

const typeTextMap: { [key in InvoiceType]: string } = {
    [InvoiceType.customer]: "فاتورة عميل",
    [InvoiceType.supplier]: "فاتورة مورد",
    [InvoiceType.contractor]: "فاتورة مقاول",
};

export const columns: ColumnDef<InvoiceWithRelations>[] = [
  {
    accessorKey: "number",
    header: "رقم الفاتورة",
  },
  {
    accessorKey: "type",
    header: "النوع",
    cell: ({ row }) => typeTextMap[row.getValue("type") as InvoiceType],
  },
  {
    accessorKey: "total",
    header: "المبلغ",
    cell: ({ row }) => formatCurrency(row.getValue("total")),
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const status = row.getValue("status") as InvoiceStatus;
      return <Badge variant={statusVariantMap[status]}>{statusTextMap[status]}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: "التاريخ",
    cell: ({ row }) => dayjs(row.getValue("date")).format("YYYY/MM/DD"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;

      const handlePost = async () => {
        if (confirm(`هل أنت متأكد من ترحيل الفاتورة رقم ${invoice.number}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
          try {
            await postInvoice(invoice.id);
            toast({ title: "نجاح", description: "تم ترحيل الفاتورة بنجاح." });
            window.location.reload();
          } catch (error) {
            toast({ variant: "destructive", title: "خطأ", description: (error as Error).message });
          }
        }
      };

      return (
        invoice.status === InvoiceStatus.draft && (
          <Button variant="outline" size="sm" onClick={handlePost}>
            ترحيل
          </Button>
        )
      );
    },
  },
]
