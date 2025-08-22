import { getInvoices, postInvoice } from "@/services/accounting/invoices";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  async function post(formData: FormData) {
    "use server";
    const id = String(formData.get('id'));
    await postInvoice(id);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">الفواتير</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">رقم</th>
              <th className="p-2 border">النوع</th>
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">الإجمالي</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id}>
                <td className="p-2 border">{inv.number}</td>
                <td className="p-2 border">{inv.type}</td>
                <td className="p-2 border">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                <td className="p-2 border">{Number(inv.total).toLocaleString('ar-EG')}</td>
                <td className="p-2 border">{inv.status}</td>
                <td className="p-2 border">
                  {inv.status === 'draft' && (
                    <form action={post}>
                      <input type="hidden" name="id" value={inv.id} />
                      <button type="submit" className="bg-green-600 text-white rounded px-3 py-1">ترحيل</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}