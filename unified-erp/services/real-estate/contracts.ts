"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PlanType } from "@prisma/client";

// Schema for creating a contract aligned with Prisma
const ContractSchema = z.object({
  clientId: z.string().cuid("العميل مطلوب"),
  unitId: z.string().cuid("الوحدة مطلوبة"),
  startDate: z.coerce.date(),
  totalAmount: z.coerce.number().positive("إجمالي المبلغ يجب أن يكون موجب"),
  downPayment: z.coerce.number().min(0, "الدفعة الأولى يجب أن تكون موجبة"),
  months: z.coerce.number().int().positive("عدد الأشهر غير صالح"),
  planType: z.nativeEnum(PlanType),
  notes: z.string().optional(),
});

export async function getContracts() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        client: true,
        unit: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return contracts;
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    throw new Error("فشل في جلب بيانات العقود.");
  }
}

export async function createContract(formData: FormData) {
  const validated = ContractSchema.safeParse({
    clientId: formData.get("clientId"),
    unitId: formData.get("unitId"),
    startDate: formData.get("startDate"),
    totalAmount: formData.get("totalAmount"),
    downPayment: formData.get("downPayment"),
    months: formData.get("months"),
    planType: formData.get("planType"),
    notes: formData.get("notes") ?? undefined,
  });

  if (!validated.success) {
    throw new Error(`Validation Error: ${JSON.stringify(validated.error.flatten().fieldErrors)}`);
  }

  const { clientId, unitId, startDate, totalAmount, downPayment, months, planType, notes } = validated.data;

  const principal = totalAmount - downPayment;
  if (principal <= 0) throw new Error("المبلغ بعد الدفعة المقدمة يجب أن يكون أكبر من صفر");

  const installmentAmount = Number((principal / months).toFixed(2));

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const contract = await tx.contract.create({
        data: {
          clientId,
          unitId,
          startDate,
          totalAmount,
          downPayment,
          months,
          planType,
          notes,
        },
      });

      // Create installments with schedule based on planType
      const installments: any[] = [];
      const baseDate = new Date(startDate);
      for (let i = 1; i <= months; i++) {
        const dueDate = new Date(baseDate);
        if (planType === "MONTHLY") {
          dueDate.setMonth(dueDate.getMonth() + i);
        } else if (planType === "QUARTERLY") {
          dueDate.setMonth(dueDate.getMonth() + i * 3);
        } else if (planType === "YEARLY") {
          dueDate.setFullYear(dueDate.getFullYear() + i);
        }
        installments.push({ contractId: contract.id, amount: installmentAmount, dueDate });
      }

      await tx.installment.createMany({ data: installments });

      // Mark unit as sold
      await tx.unit.update({ where: { id: unitId }, data: { status: "sold" } });

      return contract;
    });

    revalidatePath("/real-estate/contracts");
    revalidatePath("/dashboard");
    return result;
  } catch (error) {
    console.error("Failed to create contract:", error);
    throw new Error("فشل في إنشاء العقد.");
  }
}

// Function for creating sample contracts (accepts object instead of FormData)
export async function createSampleContract(contractData: {
  clientId: string;
  unitId: string;
  number?: string; // ignored now; schema uses unique unit only
  startDate: Date;
  endDate?: Date; // ignored
  totalAmount: number;
  downPayment: number;
  monthlyPayment?: number; // ignored
  status?: "draft" | "active" | "completed" | "cancelled"; // ignored
}) {
  // Default sample to monthly over 12 months
  const months = 12;
  const planType: PlanType = "MONTHLY";

  const form = new FormData();
  form.append("clientId", contractData.clientId);
  form.append("unitId", contractData.unitId);
  form.append("startDate", contractData.startDate.toISOString());
  form.append("totalAmount", String(contractData.totalAmount));
  form.append("downPayment", String(contractData.downPayment));
  form.append("months", String(months));
  form.append("planType", planType);

  return createContract(form);
}
