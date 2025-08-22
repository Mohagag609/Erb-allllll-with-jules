"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Voucher, Cashbox, Client, Supplier, Partner } from "@prisma/client"
import dayjs from "dayjs"
import { formatCurrency } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"

export type VoucherWithRelations = Voucher & {
  cashbox: Cashbox;
  client: Client | null;
  supplier: Supplier | null;
  partner: Partner | null;
};

export const columns: ColumnDef<VoucherWithRelations>[] = [
  {
    accessorKey: "kind",
    header: "النوع",
    cell: ({ row }) => {
        const kind = row.getValue("kind") as string;
        const variant = kind === 'receipt' ? 'success' : 'destructive';
        const text = kind === 'receipt' ? 'سند قبض' : 'سند صرف';
        return <Badge variant={variant}>{text}</Badge>
    }
  },
  {
    accessorKey: "date",
    header: "التاريخ",
    cell: ({ row }) => dayjs(row.getValue("date")).format("YYYY/MM/DD"),
  },
  {
    accessorKey: "amount",
    header: "المبلغ",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "cashbox.name",
    header: "الخزنة/البنك",
  },
  {
    accessorKey: "note",
    header: "البيان",
  },
]
