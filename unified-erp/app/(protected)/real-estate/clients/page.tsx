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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clients = await getClients();
        setData(clients);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        // In a real app, show a toast notification
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFormSubmit = async () => {
    try {
      const clients = await getClients();
      setData(clients);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to refresh clients:", error);
      // In a real app, show a toast notification
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-10">جاري التحميل...</div>;
  }

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
