import { getProjects, createProject } from "@/services/projects/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();

  async function create(formData: FormData) {
    "use server";
    await createProject(formData);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">المشاريع</h1>

      <form action={create} className="grid grid-cols-6 gap-2 mb-6">
        <input name="code" className="border p-2" placeholder="الكود" required />
        <input name="name" className="border p-2" placeholder="الاسم" required />
        <select name="status" className="border p-2">
          <option value="active">نشط</option>
          <option value="paused">موقوف</option>
          <option value="closed">مغلق</option>
        </select>
        <input name="startDate" type="date" className="border p-2" required />
        <input name="endDate" type="date" className="border p-2" />
        <input name="budget" type="number" step="0.01" className="border p-2" placeholder="الميزانية" />
        <button type="submit" className="bg-blue-600 text-white rounded px-4">إضافة</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">الكود</th>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">البداية</th>
              <th className="p-2 border">الميزانية</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p: any) => (
              <tr key={p.id}>
                <td className="p-2 border">{p.code}</td>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.status}</td>
                <td className="p-2 border">{new Date(p.startDate).toLocaleDateString('ar-EG')}</td>
                <td className="p-2 border">{p.budget ? Number(p.budget).toLocaleString('ar-EG') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}