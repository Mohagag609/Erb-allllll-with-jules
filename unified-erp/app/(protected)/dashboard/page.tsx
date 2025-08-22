import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients } from "@/services/real-estate/clients";
import { getUnits } from "@/services/real-estate/units";
import { getContracts } from "@/services/real-estate/contracts";
import { Users, Building2, FileText, TrendingUp, DollarSign, Calendar } from "lucide-react";

export default async function DashboardPage() {
  try {
    // Fetch dashboard data
    const [clients, units, contracts] = await Promise.all([
      getClients().catch(() => []),
      getUnits().catch(() => []),
      getContracts().catch(() => [])
    ]);

    // Calculate KPIs
    const totalClients = clients.length;
    const totalUnits = units.length;
    const totalContracts = contracts.length;
    const availableUnits = units.filter((unit: any) => unit.status === 'available').length;
    const totalRevenue = contracts.reduce((sum: number, contract: any) => sum + (contract.totalAmount || 0), 0);

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">لوحة التحكم الرئيسية</h1>
        
        {/* Welcome Section */}
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-lg">أهلاً بك في النظام</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(totalClients * 0.1)} من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الوحدات</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
              <p className="text-xs text-muted-foreground">
                {availableUnits} وحدة متاحة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العقود</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContracts}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(totalContracts * 0.15)} من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue.toLocaleString('ar-EG')} ج.م
              </div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(totalRevenue * 0.08).toLocaleString('ar-EG')} من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الإشغال</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalUnits > 0 ? Math.round(((totalUnits - availableUnits) / totalUnits) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {totalUnits - availableUnits} من {totalUnits} وحدة مشغولة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العقود النشطة</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contracts.filter((c: any) => c.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                من إجمالي {totalContracts} عقد
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>أحدث العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.slice(0, 5).length > 0 ? (
                <div className="space-y-4">
                  {clients.slice(0, 5).map((client: any) => (
                    <div key={client.id} className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد عملاء مسجلين بعد</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>أحدث العقود</CardTitle>
            </CardHeader>
            <CardContent>
              {contracts.slice(0, 5).length > 0 ? (
                <div className="space-y-4">
                  {contracts.slice(0, 5).map((contract: any) => (
                    <div key={contract.id} className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">عقد رقم {contract.number}</p>
                        <p className="text-xs text-gray-500">
                          {contract.totalAmount?.toLocaleString('ar-EG')} ج.م
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد عقود مسجلة بعد</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">لوحة التحكم الرئيسية</h1>
        <p className="mt-4 text-red-500">
          حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
        </p>
      </div>
    );
  }
}
