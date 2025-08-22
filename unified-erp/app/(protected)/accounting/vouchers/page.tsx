"use client";

import { useState, useEffect } from "react";
import { getVouchers } from "@/services/accounting/vouchers";
import { columns, VoucherWithRelations } from "./columns";
import { DataTable } from "@/components/datatable/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VoucherForm } from "@/components/forms/voucher-form";

export default function VouchersPage() {
  const [data, setData] = useState<VoucherWithRelations[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    const vouchers = await getVouchers();
    setData(vouchers as VoucherWithRelations[]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = () => {
    fetchData();
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">سندات القبض والصرف</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>إنشاء سند جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>إنشاء سند جديد</DialogTitle>
            </DialogHeader>
            <VoucherForm onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="note"
        filterPlaceholder="فلترة بالبيان..."
      />
    </div>
  );
}
