"use client";

import { useState, useEffect } from "react";
import { getPartners } from "@/services/real-estate/partners";
import { columns } from "./columns";
import { DataTable } from "@/components/datatable/data-table";
import { Button } from "@/components/ui/button";
import { Partner } from "@prisma/client";

export default function PartnersPage() {
  const [data, setData] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const partners = await getPartners();
      setData(partners);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة الشركاء</h1>
        <Button>إضافة شريك جديد</Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="name"
        filterPlaceholder="فلترة باسم الشريك..."
      />
    </div>
  );
}
