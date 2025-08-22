import { createBankImport, matchInstallments } from "@/services/accounting/bank-imports";
import prisma from "@/lib/prisma";

export default async function BankImportsPage() {
  const imports = await prisma.bankImport.findMany({ orderBy: { date: 'desc' } });

  async function create(formData: FormData) {
    "use server";
    await createBankImport(formData);
  }

  async function match() {
    "use server";
    await matchInstallments();
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">كشوفات البنك</h1>

      <form action={create} className="grid grid-cols-6 gap-2 mb-6">
        <input name="date" type="date" className="border p-2" required />
        <input name="amount" type="number" step="0.01" className="border p-2" placeholder="المبلغ" required />
        <select name="type" className="border p-2" required>
          <option value="credit">إيداع</option>
          <option value="debit">سحب</option>
        </select>
        <input name="reference" className="border p-2" placeholder="المرجع" />
        <input name="bankName" className="border p-2" placeholder="البنك" />
        <button type="submit" className="bg-blue-600 text-white rounded px-4">إضافة حركة</button>
      </form>

      <form action={match} className="mb-6">
        <button type="submit" className="bg-green-600 text-white rounded px-4 py-2">مطابقة الأقساط</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">النوع</th>
              <th className="p-2 border">المبلغ</th>
              <th className="p-2 border">المرجع</th>
              <th className="p-2 border">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((i: any) => (
              <tr key={i.id}>
                <td className="p-2 border">{new Date(i.date).toLocaleDateString('ar-EG')}</td>
                <td className="p-2 border">{i.type}</td>
                <td className="p-2 border">{Number(i.amount).toLocaleString('ar-EG')}</td>
                <td className="p-2 border">{i.reference ?? '-'}</td>
                <td className="p-2 border">{i.posted ? 'مُرحّل' : 'مسودة'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}