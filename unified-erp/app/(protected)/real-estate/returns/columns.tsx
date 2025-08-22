"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Return, Unit } from "@prisma/client"
import dayjs from "dayjs"
import { Badge } from "@/components/ui/badge"

export type ReturnWithUnit = Return & {
  unit: Unit;
};

export const columns: ColumnDef<ReturnWithUnit>[] = [
  {
    accessorKey: "unit.code",
    header: "كود الوحدة",
  },
  {
    accessorKey: "reason",
    header: "سبب الإرجاع",
  },
  {
    accessorKey: "resaleStatus",
    header: "حالة إعادة البيع",
    cell: ({ row }) => {
        const status = row.getValue("resaleStatus") as string;
        const variant = status === 'resold' ? 'success' : 'default';
        const text = status === 'resold' ? 'تمت إعادة البيع' : 'قيد الانتظار';
        return <Badge variant={variant}>{text}</Badge>
    }
  },
  {
    accessorKey: "createdAt",
    header: "تاريخ الإرجاع",
    cell: ({ row }) => dayjs(row.getValue("createdAt")).format("YYYY/MM/DD"),
  },
]
