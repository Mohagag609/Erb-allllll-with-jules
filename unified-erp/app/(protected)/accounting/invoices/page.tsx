"use client";

import { useState, useEffect } from "react";
import { getInvoices } from "@/services/accounting/invoices";
import { columns, InvoiceWithRelations } from "./columns";
import { DataTable } from "@/components/datatable/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InvoiceForm } from "@/components/forms/invoice-form";

export default function InvoicesPage() {
  const [data, setData] = useState<InvoiceWithRelations[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    const invoices = await getInvoices();
    setData(invoices as InvoiceWithRelations[]);
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
        <h1 className="text-3xl font-bold">إدارة الفواتير</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>إنشاء فاتورة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة (مسودة)</DialogTitle>
            </DialogHeader>
            <InvoiceForm onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="number"
        filterPlaceholder="فلترة برقم الفاتورة..."
      />
    </div>
  );
}
