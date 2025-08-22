import { getJournalEntries } from "@/services/accounting/journal";

export default async function JournalPage() {
  const entries = await getJournalEntries();
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">قيود اليومية</h1>
      {entries.map((e: any) => (
        <div key={e.id} className="mb-6 border rounded">
          <div className="p-2 bg-gray-50 flex justify-between">
            <div>التاريخ: {new Date(e.date).toLocaleDateString('ar-EG')}</div>
            <div>الوصف: {e.description}</div>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 border">الحساب</th>
                <th className="p-2 border">مدين</th>
                <th className="p-2 border">دائن</th>
              </tr>
            </thead>
            <tbody>
              {e.lines.map((l: any) => (
                <tr key={l.id}>
                  <td className="p-2 border">{l.account?.code} - {l.account?.name}</td>
                  <td className="p-2 border">{Number(l.debit).toLocaleString('ar-EG')}</td>
                  <td className="p-2 border">{Number(l.credit).toLocaleString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}