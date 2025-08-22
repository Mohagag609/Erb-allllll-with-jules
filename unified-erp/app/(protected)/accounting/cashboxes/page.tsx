import { getCashboxes } from "@/services/accounting/cashboxes";

export default async function CashboxesPage() {
  const cashboxes = await getCashboxes();
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">الخزن والبنوك</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">الكود</th>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">المشروع</th>
              <th className="p-2 border">حساب الأستاذ</th>
            </tr>
          </thead>
          <tbody>
            {cashboxes.map((cb: any) => (
              <tr key={cb.id}>
                <td className="p-2 border">{cb.code}</td>
                <td className="p-2 border">{cb.name}</td>
                <td className="p-2 border">{cb.project?.name ?? '-'}</td>
                <td className="p-2 border">{cb.account?.code} - {cb.account?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}