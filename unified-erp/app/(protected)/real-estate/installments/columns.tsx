"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Contract, Client, Unit, Installment, InstallmentStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"
import { markInstallmentAsPaid } from "@/services/real-estate/installments"
import { toast } from "@/hooks/use-toast"

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
};

const statusTextMap: { [key in InstallmentStatus]: string } = {
  [InstallmentStatus.PENDING]: "مستحق",
  [InstallmentStatus.PAID]: "مدفوع",
  [InstallmentStatus.OVERDUE]: "متأخر",
};

const statusVariantMap: { [key in InstallmentStatus]: "default" | "success" | "destructive" } = {
    [InstallmentStatus.PENDING]: "default",
    [InstallmentStatus.PAID]: "success",
    [InstallmentStatus.OVERDUE]: "destructive",
};

export type InstallmentWithRelations = Installment & {
  contract: Contract & {
    client: Client;
    unit: Unit;
  };
};

export const columns: ColumnDef<InstallmentWithRelations>[] = [
  {
    accessorKey: "contract.client.name",
    header: "العميل",
  },
  {
    accessorKey: "contract.unit.code",
    header: "كود الوحدة",
  },
  {
    accessorKey: "amount",
    header: "المبلغ",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "dueDate",
    header: "تاريخ الاستحقاق",
    cell: ({ row }) => dayjs(row.getValue("dueDate")).format("YYYY/MM/DD"),
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const status = row.getValue("status") as InstallmentStatus;
      return <Badge variant={statusVariantMap[status]}>{statusTextMap[status]}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const installment = row.original;

      const handleMarkAsPaid = async () => {
        try {
          // In a real app, a dialog would open to select a cashbox.
          // For now, we'll use a placeholder default cashbox ID.
          // This requires a default cashbox to be created in the seed script.
          const defaultCashboxId = "clgq0x1z00000v2q1h8g1z2x3"; // Placeholder
          await markInstallmentAsPaid(installment.id, defaultCashboxId);
          toast({ title: "نجاح", description: "تم تحديث حالة القسط بنجاح." });
          // The page will be revalidated by the server action.
          window.location.reload(); // Simple way to refresh data
        } catch (error) {
          toast({ variant: "destructive", title: "خطأ", description: (error as Error).message });
        }
      };

      return (
        installment.status !== InstallmentStatus.PAID && (
          <Button variant="outline" size="sm" onClick={handleMarkAsPaid}>
            تحديد كمدفوع
          </Button>
        )
      );
    },
  },
]
