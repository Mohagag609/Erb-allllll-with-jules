import { getPhases, createPhase } from "@/services/projects/phases";
import prisma from "@/lib/prisma";

export default async function PhasesPage() {
  const phases = await getPhases();
  const projects = await prisma.project.findMany({ orderBy: { name: 'asc' } });

  async function create(formData: FormData) {
    "use server";
    await createPhase(formData);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">المراحل</h1>

      <form action={create} className="grid grid-cols-5 gap-2 mb-6">
        <select name="projectId" className="border p-2" required>
          <option value="">اختر مشروعًا...</option>
          {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input name="name" className="border p-2" placeholder="اسم المرحلة" required />
        <input name="startDate" type="date" className="border p-2" />
        <input name="endDate" type="date" className="border p-2" />
        <button type="submit" className="bg-blue-600 text-white rounded px-4">إضافة</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">المشروع</th>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">البدء</th>
              <th className="p-2 border">الانتهاء</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((ph: any) => (
              <tr key={ph.id}>
                <td className="p-2 border">{projects.find((p: any) => p.id === ph.projectId)?.name ?? '-'}</td>
                <td className="p-2 border">{ph.name}</td>
                <td className="p-2 border">{ph.startDate ? new Date(ph.startDate).toLocaleDateString('ar-EG') : '-'}</td>
                <td className="p-2 border">{ph.endDate ? new Date(ph.endDate).toLocaleDateString('ar-EG') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}