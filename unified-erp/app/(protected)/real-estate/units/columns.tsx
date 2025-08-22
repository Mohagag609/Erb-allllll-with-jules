"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Unit, UnitStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
};

const statusTextMap: { [key in UnitStatus]: string } = {
  [UnitStatus.available]: "متاحة",
  [UnitStatus.sold]: "مباعة",
  [UnitStatus.returned]: "مرتجعة",
};

const statusVariantMap: { [key in UnitStatus]: "success" | "secondary" | "destructive" } = {
    [UnitStatus.available]: "success",
    [UnitStatus.sold]: "secondary",
    [UnitStatus.returned]: "destructive",
};


export const columns: ColumnDef<Unit>[] = [
  {
    accessorKey: "code",
    header: "الكود",
  },
  {
    accessorKey: "type",
    header: "النوع",
  },
  {
    accessorKey: "price",
    header: "السعر",
    cell: ({ row }) => formatCurrency(row.getValue("price")),
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const status = row.getValue("status") as UnitStatus;
      return <Badge variant={statusVariantMap[status]}>{statusTextMap[status]}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "تاريخ الإنشاء",
    cell: ({ row }) => {
      return <span>{dayjs(row.getValue("createdAt")).format("YYYY/MM/DD")}</span>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const unit = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">فتح القائمة</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-sans">
            <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(unit.id)}
            >
              نسخ المعرّف
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>تعديل الوحدة</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500 hover:!text-red-500 focus:!text-red-500">حذف الوحدة</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
