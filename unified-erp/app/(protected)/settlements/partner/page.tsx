import prisma from "@/lib/prisma";
import { runPartnerSettlement } from "@/services/settlements/partner";

export default async function PartnerSettlementPage() {
  const projects = await prisma.project.findMany({ orderBy: { name: 'asc' } });

  async function settle(formData: FormData) {
    "use server";
    const projectId = String(formData.get('projectId'));
    await runPartnerSettlement(projectId);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">تسوية الشركاء</h1>

      <form action={settle} className="flex gap-2 mb-6">
        <select name="projectId" className="border p-2" required>
          <option value="">اختر مشروعًا</option>
          {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded px-4">تشغيل التسوية</button>
      </form>

      <p className="text-sm text-gray-600">سيتم إنشاء قيد تسوية تلقائيًا وتحديث أرصدة الشركاء.</p>
    </div>
  );
}