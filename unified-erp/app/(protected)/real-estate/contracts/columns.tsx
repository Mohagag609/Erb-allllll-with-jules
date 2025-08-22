"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
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
import { deleteContract } from "@/services/real-estate/contracts"
import { useToast } from "@/hooks/use-toast"

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

const CellActions = ({ row }: { row: Row<ContractWithRelations> }) => {
  const { toast } = useToast();
  const contract = row.original;

  const handleDelete = async () => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف العقد رقم ${contract.id.substring(0,8)}؟ سيتم حذف جميع الأقساط المرتبطة به.`)) {
      try {
        await deleteContract(contract.id);
        toast({ title: "نجاح", description: "تم حذف العقد بنجاح." });
        // The page will need to reload or refetch data.
        window.location.reload();
      } catch (error) {
        toast({ variant: "destructive", title: "خطأ", description: (error as Error).message });
      }
    }
  };

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
        <DropdownMenuItem onClick={() => alert(`تعديل العقد ${contract.id}`)}>
          تعديل العقد
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => alert('سيتم تنفيذ طباعة العقد هنا')}>
          طباعة العقد
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-500 focus:!text-red-500"
          onClick={handleDelete}
        >
          حذف العقد
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<ContractWithRelations>[] = [
  {
    accessorKey: "id",
    header: "رقم العقد",
    cell: ({ row }) => <span className="font-mono">{(row.getValue("id") as string).substring(0, 8)}...</span>
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
    cell: ({ row }) => <CellActions row={row} />,
  },
]
