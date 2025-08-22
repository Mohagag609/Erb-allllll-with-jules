import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { PlanType, UnitStatus } from "@prisma/client";

export async function ensureDemoData() {
  try {
    const [clientsCount, unitsCount, contractsCount] = await Promise.all([
      prisma.client.count(),
      prisma.unit.count(),
      prisma.contract.count(),
    ]);

    if (clientsCount === 0) {
      await prisma.client.createMany({
        data: [
          { name: "عميل تجريبي 1", phone: "01000000001", email: "c1@example.com", address: "القاهرة" },
          { name: "عميل تجريبي 2", phone: "01000000002", email: "c2@example.com", address: "الجيزة" },
        ],
      });
    }

    if (unitsCount === 0) {
      await prisma.unit.createMany({
        data: [
          { code: "U-101", type: "شقة", area: new Decimal(120), price: new Decimal(500000), status: UnitStatus.available },
          { code: "U-102", type: "شقة", area: new Decimal(150), price: new Decimal(650000), status: UnitStatus.available },
        ] as any,
      });
    }

    if (contractsCount === 0) {
      const client = await prisma.client.findFirst();
      const unit = await prisma.unit.findFirst({ where: { status: UnitStatus.available } });
      if (client && unit) {
        await prisma.contract.create({
          data: {
            clientId: client.id,
            unitId: unit.id,
            startDate: new Date(),
            totalAmount: new Decimal(500000),
            downPayment: new Decimal(100000),
            months: 12,
            planType: PlanType.MONTHLY,
            notes: "عقد تجريبي",
            installments: {
              createMany: {
                data: Array.from({ length: 12 }).map((_, i) => ({
                  amount: new Decimal( (500000 - 100000) / 12 ),
                  dueDate: new Date(new Date().setMonth(new Date().getMonth() + i + 1)),
                })),
              },
            },
          },
        });
        await prisma.unit.update({ where: { id: unit.id }, data: { status: UnitStatus.sold } });
      }
    }
  } catch (e) {
    // If DB not available, silently skip
    console.warn('ensureDemoData skipped:', e);
  }
}