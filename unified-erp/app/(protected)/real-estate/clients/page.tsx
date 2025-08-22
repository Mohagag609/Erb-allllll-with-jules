"use client"; // This page now needs client-side interactivity for the dialog

import { useState, useEffect } from "react";
import { getClients } from "@/services/real-estate/clients";
import { columns } from "./columns";
import { DataTable } from "@/components/datatable/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/client-form";
import { Client } from "@prisma/client";

export default function ClientsPage() {
  const [data, setData] = useState<Client[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const clients = await getClients();
      setData(clients);
    };
    fetchData();
  }, []);

  const handleFormSubmit = async () => {
    const clients = await getClients();
    setData(clients);
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة العملاء</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>إضافة عميل جديد</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
            </DialogHeader>
            <ClientForm onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="name"
        filterPlaceholder="فلترة بالاسم..."
      />
    </div>
  );
}
