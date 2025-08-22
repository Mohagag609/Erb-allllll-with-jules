import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSampleClient } from "@/services/real-estate/clients";
import { createSampleUnit } from "@/services/real-estate/units";
import { createSampleContract } from "@/services/real-estate/contracts";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect('/login');
    }

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">إعداد البيانات التجريبية</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>إضافة عملاء تجريبيين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                إضافة 5 عملاء تجريبيين للاختبار
              </p>
              <form action={async () => {
                'use server';
                try {
                  const sampleClients = [
                    { name: "أحمد محمد علي", phone: "01012345678", email: "ahmed@example.com", address: "القاهرة" },
                    { name: "فاطمة أحمد حسن", phone: "01023456789", email: "fatima@example.com", address: "الإسكندرية" },
                    { name: "محمد علي أحمد", phone: "01034567890", email: "mohamed@example.com", address: "الجيزة" },
                    { name: "سارة محمود حسن", phone: "01045678901", email: "sara@example.com", address: "المنوفية" },
                    { name: "علي أحمد محمد", phone: "01056789012", email: "ali@example.com", address: "الشرقية" }
                  ];

                  for (const client of sampleClients) {
                    await createSampleClient(client);
                  }
                } catch (error) {
                  console.error("Failed to create sample clients:", error);
                }
              }}>
                <Button type="submit" className="w-full">
                  إضافة عملاء تجريبيين
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إضافة وحدات تجريبية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                إضافة 10 وحدات تجريبية للاختبار
              </p>
              <form action={async () => {
                'use server';
                try {
                  const sampleUnits = [
                    { number: "A101", type: "شقة", area: 120, price: 500000, status: "available" as const, location: "برج 1" },
                    { number: "A102", type: "شقة", area: 150, price: 650000, status: "available" as const, location: "برج 1" },
                    { number: "A201", type: "شقة", area: 120, price: 520000, status: "available" as const, location: "برج 1" },
                    { number: "A202", type: "شقة", area: 150, price: 670000, status: "available" as const, location: "برج 1" },
                    { number: "B101", type: "دوبلكس", area: 200, price: 800000, status: "available" as const, location: "برج 2" },
                    { number: "B102", type: "دوبلكس", area: 250, price: 1000000, status: "available" as const, location: "برج 2" },
                    { number: "C101", type: "فيلا", area: 300, price: 1500000, status: "available" as const, location: "برج 3" },
                    { number: "C102", type: "فيلا", area: 350, price: 1800000, status: "available" as const, location: "برج 3" },
                    { number: "D101", type: "مكتب", area: 80, price: 400000, status: "available" as const, location: "برج 4" },
                    { number: "D102", type: "مكتب", area: 100, price: 500000, status: "available" as const, location: "برج 4" }
                  ];

                  for (const unit of sampleUnits) {
                    await createSampleUnit(unit);
                  }
                } catch (error) {
                  console.error("Failed to create sample units:", error);
                }
              }}>
                <Button type="submit" className="w-full">
                  إضافة وحدات تجريبية
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إضافة عقود تجريبية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                إضافة 3 عقود تجريبية للاختبار
              </p>
              <form action={async () => {
                'use server';
                try {
                  // First get some clients and units
                  const { getClients } = await import("@/services/real-estate/clients");
                  const { getUnits } = await import("@/services/real-estate/units");
                  
                  const clients = await getClients();
                  const units = await getUnits();
                  
                  if (clients.length > 0 && units.length > 0) {
                    const sampleContracts = [
                      {
                        clientId: clients[0].id,
                        unitId: units[0].id,
                        number: "CON-001",
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                        totalAmount: 500000,
                        downPayment: 100000,
                        monthlyPayment: 15000,
                        status: "active" as const
                      },
                      {
                        clientId: clients[1]?.id || clients[0].id,
                        unitId: units[1]?.id || units[0].id,
                        number: "CON-002",
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        totalAmount: 650000,
                        downPayment: 130000,
                        monthlyPayment: 18000,
                        status: "active" as const
                      },
                      {
                        clientId: clients[2]?.id || clients[0].id,
                        unitId: units[2]?.id || units[0].id,
                        number: "CON-003",
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        totalAmount: 800000,
                        downPayment: 160000,
                        monthlyPayment: 22000,
                        status: "active" as const
                      }
                    ];

                    for (const contract of sampleContracts) {
                      await createSampleContract(contract);
                    }
                  }
                } catch (error) {
                  console.error("Failed to create sample contracts:", error);
                }
              }}>
                <Button type="submit" className="w-full">
                  إضافة عقود تجريبية
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>تعليمات الاستخدام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>1. <strong>أولاً:</strong> قم بإضافة العملاء التجريبيين</p>
                <p>2. <strong>ثانياً:</strong> قم بإضافة الوحدات التجريبية</p>
                <p>3. <strong>ثالثاً:</strong> قم بإضافة العقود التجريبية</p>
                <p>4. <strong>أخيراً:</strong> انتقل إلى <a href="/dashboard" className="text-blue-600 hover:underline">لوحة التحكم</a> لرؤية البيانات</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load setup page:", error);
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">إعداد البيانات التجريبية</h1>
        <p className="mt-4 text-red-500">
          حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
        </p>
      </div>
    );
  }
}