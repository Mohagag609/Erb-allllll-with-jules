import { createTransfer } from "@/services/accounting/transfers";
import prisma from "@/lib/prisma";

export default async function TransfersPage() {
  const transfers = await prisma.transfer.findMany({
    orderBy: { date: 'desc' },
    include: { fromCashbox: true, toCashbox: true },
  });

  async function create(formData: FormData) {
    "use server";
    await createTransfer(formData);
  }

  const cashboxes = await prisma.cashbox.findMany({ orderBy: { code: 'asc' } });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">تحويلات الخزن</h1>

      <form action={create} className="grid grid-cols-5 gap-2 mb-6">
        <select name="fromCashboxId" className="border p-2" required>
          <option value="">من خزنة...</option>
          {cashboxes.map((cb: { id: string; code: string; name: string }) => <option key={cb.id} value={cb.id}>{cb.code} - {cb.name}</option>)}
        </select>
        <select name="toCashboxId" className="border p-2" required>
          <option value="">إلى خزنة...</option>
          {cashboxes.map((cb: { id: string; code: string; name: string }) => <option key={cb.id} value={cb.id}>{cb.code} - {cb.name}</option>)}
        </select>
        <input name="date" type="date" className="border p-2" required />
        <input name="amount" type="number" step="0.01" className="border p-2" placeholder="المبلغ" required />
        <button type="submit" className="bg-blue-600 text-white rounded px-4">تحويل</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">من</th>
              <th className="p-2 border">إلى</th>
              <th className="p-2 border">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t: any) => (
              <tr key={t.id}>
                <td className="p-2 border">{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                <td className="p-2 border">{t.fromCashbox.code} - {t.fromCashbox.name}</td>
                <td className="p-2 border">{t.toCashbox.code} - {t.toCashbox.name}</td>
                <td className="p-2 border">{Number(t.amount).toLocaleString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}