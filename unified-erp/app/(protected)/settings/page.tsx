export default function SettingsPage() {
  async function backup() {
    "use server";
    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/backups/run`, { method: 'POST' });
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>
      <form action={backup}>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">تشغيل النسخ الاحتياطي الآن</button>
      </form>
    </div>
  );
}