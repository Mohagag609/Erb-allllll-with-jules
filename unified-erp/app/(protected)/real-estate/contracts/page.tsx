import { getContracts } from "@/services/real-estate/contracts";
import { columns, ContractWithRelations } from "./columns";
import { DataTable } from "@/components/datatable/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function ContractsPage() {
  const contracts = await getContracts();

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
        data={contracts as ContractWithRelations[]}
        filterColumn="client.name"
        filterPlaceholder="فلترة باسم العميل..."
      />
    </div>
  );
}
