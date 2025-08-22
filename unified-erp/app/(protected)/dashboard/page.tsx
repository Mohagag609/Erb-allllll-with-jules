import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">لوحة التحكم الرئيسية</h1>
      <p className="mt-4">
        أهلاً بك، {session?.user?.name ?? "المستخدم"}.
      </p>
      <p className="mt-2">
        صلاحياتك الحالية: {session?.user?.role ?? "غير محدد"}
      </p>
      <div className="mt-8">
        {/* KPI Cards and Charts will be added here */}
        <p className="text-gray-500">
          سيتم عرض بطاقات الأداء الرئيسية (KPIs) والمخططات البيانية هنا قريباً.
        </p>
      </div>
    </div>
  );
}
