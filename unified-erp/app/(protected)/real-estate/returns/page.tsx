"use client";

import { useState, useEffect } from "react";
import { getReturns } from "@/services/real-estate/returns";
import { columns, ReturnWithUnit } from "./columns";
import { DataTable } from "@/components/datatable/data-table";
import { Button } from "@/components/ui/button";

export default function ReturnsPage() {
  const [data, setData] = useState<ReturnWithUnit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const returns = await getReturns();
      setData(returns as ReturnWithUnit[]);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المرتجعات</h1>
        <Button>إضافة مرتجع جديد</Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="unit.code"
        filterPlaceholder="فلترة بكود الوحدة..."
      />
    </div>
  );
}
