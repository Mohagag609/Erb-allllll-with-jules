import { getMaterialMoves, createMaterialMove } from "@/services/projects/material-moves";
import prisma from "@/lib/prisma";

export default async function MaterialMovesPage() {
  const moves = await getMaterialMoves();
  const projects = await prisma.project.findMany({ orderBy: { name: 'asc' } });
  const materials = await prisma.material.findMany({ orderBy: { name: 'asc' } });
  const phases = await prisma.phase.findMany({ orderBy: { name: 'asc' } });

  async function create(formData: FormData) {
    "use server";
    await createMaterialMove(formData);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">حركة المواد</h1>

      <form action={create} className="grid grid-cols-7 gap-2 mb-6">
        <select name="projectId" className="border p-2" required>
          <option value="">المشروع</option>
          {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select name="materialId" className="border p-2" required>
          <option value="">المادة</option>
          {materials.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select name="type" className="border p-2" required>
          <option value="in">إدخال</option>
          <option value="out">إخراج</option>
          <option value="adjust">تسوية</option>
        </select>
        <input name="qty" type="number" step="0.001" className="border p-2" placeholder="الكمية" required />
        <input name="unitCost" type="number" step="0.01" className="border p-2" placeholder="تكلفة الوحدة" required />
        <input name="date" type="date" className="border p-2" required />
        <select name="phaseId" className="border p-2">
          <option value="">المرحلة (اختياري)</option>
          {phases.map((ph: any) => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded px-4">إضافة</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">المشروع</th>
              <th className="p-2 border">المادة</th>
              <th className="p-2 border">النوع</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">تكلفة الوحدة</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((mv: any) => (
              <tr key={mv.id}>
                <td className="p-2 border">{new Date(mv.date).toLocaleDateString('ar-EG')}</td>
                <td className="p-2 border">{projects.find((p: any) => p.id === mv.projectId)?.name ?? '-'}</td>
                <td className="p-2 border">{materials.find((m: any) => m.id === mv.materialId)?.name ?? '-'}</td>
                <td className="p-2 border">{mv.type}</td>
                <td className="p-2 border">{Number(mv.qty).toLocaleString('ar-EG')}</td>
                <td className="p-2 border">{Number(mv.unitCost).toLocaleString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}