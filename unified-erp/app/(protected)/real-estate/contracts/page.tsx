"use client";

import { useState, useEffect } from "react";
import { getContracts } from "@/services/real-estate/contracts";
import { columns, ContractWithRelations } from "./columns";
import { DataTable } from "@/components/datatable/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function ContractsPage() {
  const [data, setData] = useState<ContractWithRelations[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const contracts = await getContracts();
      setData(contracts as ContractWithRelations[]);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة العقود</h1>
        <Button asChild>
          <Link href="/real-estate/contracts/new">
            <PlusCircle className="ml-2 h-4 w-4" />
            عقد جديد
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="client.name"
        filterPlaceholder="فلترة باسم العميل..."
      />
    </div>
  );
}
