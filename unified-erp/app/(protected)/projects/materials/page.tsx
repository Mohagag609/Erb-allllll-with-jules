import { getMaterials, createMaterial } from "@/services/projects/materials";

export default async function MaterialsPage() {
  const materials = await getMaterials();

  async function create(formData: FormData) {
    "use server";
    await createMaterial(formData);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">المواد</h1>

      <form action={create} className="grid grid-cols-4 gap-2 mb-6">
        <input name="name" className="border p-2" placeholder="الاسم" required />
        <input name="unit" className="border p-2" placeholder="الوحدة" required />
        <input name="defaultUnitCost" type="number" step="0.01" className="border p-2" placeholder="تكلفة افتراضية" />
        <button type="submit" className="bg-blue-600 text-white rounded px-4">إضافة</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">الوحدة</th>
              <th className="p-2 border">التكلفة الافتراضية</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m: any) => (
              <tr key={m.id}>
                <td className="p-2 border">{m.name}</td>
                <td className="p-2 border">{m.unit}</td>
                <td className="p-2 border">{m.defaultUnitCost ? Number(m.defaultUnitCost).toLocaleString('ar-EG') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}