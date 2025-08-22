"use client";

import { useState, useEffect } from "react";
import { getUnits } from "@/services/real-estate/units";
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
import { UnitForm } from "@/components/forms/unit-form";
import { Unit } from "@prisma/client";

export default function UnitsPage() {
  const [data, setData] = useState<Unit[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    const units = await getUnits();
    setData(units);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = () => {
    fetchData(); // Refetch data after submission
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة الوحدات العقارية</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>إضافة وحدة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>إضافة وحدة عقارية جديدة</DialogTitle>
            </DialogHeader>
            <UnitForm onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="code"
        filterPlaceholder="فلترة بالكود..."
      />
    </div>
  );
}
