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
import { Contract, Client, Unit, PlanType } from "@prisma/client"
import dayjs from "dayjs"

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
};

const planTypeTextMap: { [key in PlanType]: string } = {
    [PlanType.MONTHLY]: "شهري",
    [PlanType.QUARTERLY]: "ربع سنوي",
    [PlanType.YEARLY]: "سنوي",
};

// We define a new type that includes the relations
export type ContractWithRelations = Contract & {
  client: Client;
  unit: Unit;
};

export const columns: ColumnDef<ContractWithRelations>[] = [
  {
    accessorKey: "id",
    header: "رقم العقد",
    cell: ({ row }) => <span className="font-mono">{row.getValue("id").substring(0, 8)}...</span>
  },
  {
    accessorKey: "client.name",
    header: "العميل",
  },
  {
    accessorKey: "unit.code",
    header: "كود الوحدة",
  },
  {
    accessorKey: "totalAmount",
    header: "المبلغ الإجمالي",
    cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
  },
  {
    accessorKey: "planType",
    header: "نظام السداد",
    cell: ({ row }) => planTypeTextMap[row.getValue("planType") as PlanType],
  },
  {
    accessorKey: "startDate",
    header: "تاريخ البدء",
    cell: ({ row }) => dayjs(row.getValue("startDate")).format("YYYY/MM/DD"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contract = row.original

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
            <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
            <DropdownMenuItem>طباعة العقد</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:!text-red-500">فسخ العقد</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
