"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PlanType, UnitStatus, InstallmentStatus } from "@prisma/client";
import dayjs from "dayjs";

const ContractSchema = z.object({
  clientId: z.string().cuid("يجب تحديد عميل صالح"),
  unitId: z.string().cuid("يجب تحديد وحدة صالحة"),
  startDate: z.coerce.date({ required_error: "تاريخ البدء مطلوب" }),
  totalAmount: z.coerce.number().positive("المبلغ الإجمالي يجب أن يكون موجبًا"),
  downPayment: z.coerce.number().min(0, "الدفعة المقدمة لا يمكن أن تكون سالبة"),
  months: z.coerce.number().int().positive("عدد الأشهر يجب أن يكون رقمًا صحيحًا موجبًا"),
  planType: z.nativeEnum(PlanType),
  notes: z.string().optional(),
});

export async function getContracts() {
  try {
    const contracts = await prisma.contract.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: true,
        unit: true,
      },
    });
    return contracts;
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    throw new Error("فشل في جلب بيانات العقود.");
  }
}

export async function createContract(formData: FormData) {
  const validatedFields = ContractSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    throw new Error("بيانات العقد غير صالحة.");
  }

  const {
    clientId,
    unitId,
    startDate,
    totalAmount,
    downPayment,
    months,
    planType,
    notes,
  } = validatedFields.data;

  // Ensure unit is available before proceeding
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit || unit.status !== UnitStatus.available) {
    throw new Error("الوحدة المحددة ليست متاحة.");
  }

  const installmentAmount = (totalAmount - downPayment) / months;

  try {
    await prisma.$transaction(async (tx) => {
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

      const installments = [];
      for (let i = 0; i < months; i++) {
        let dueDate: Date;
        const period = i + 1;
        if (planType === PlanType.MONTHLY) {
          dueDate = dayjs(startDate).add(period, "month").toDate();
        } else if (planType === PlanType.QUARTERLY) {
          dueDate = dayjs(startDate).add(period * 3, "month").toDate();
        } else { // YEARLY
          dueDate = dayjs(startDate).add(period, "year").toDate();
        }

        installments.push({
          contractId: contract.id,
          amount: installmentAmount,
          dueDate: dueDate,
          status: InstallmentStatus.PENDING,
        });
      }

      if (installments.length > 0) {
        await tx.installment.createMany({
          data: installments,
        });
      }

      await tx.unit.update({
        where: { id: unitId },
        data: { status: UnitStatus.sold },
      });
    });

    revalidatePath("/real-estate/contracts");
    revalidatePath("/real-estate/units");
  } catch (error) {
    console.error("Failed to create contract:", error);
    throw new Error("فشل في إنشاء العقد والأقساط.");
  }
}

// updateContract would be more complex, as it might require regenerating installments.
// This is a simplified version for now.
export async function updateContract(contractId: string, formData: FormData) {
  // Add Zod validation for update schema
  const notes = formData.get("notes") as string;
  try {
    await prisma.contract.update({
      where: { id: contractId },
      data: { notes },
    });
    revalidatePath("/real-estate/contracts");
  } catch (error) {
    console.error(`Failed to update contract ${contractId}:`, error);
    throw new Error("فشل في تحديث العقد.");
  }
}

export async function deleteContract(contractId: string) {
  try {
    // This must be a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findUnique({
        where: { id: contractId },
        select: { unitId: true }
      });
      if (!contract) throw new Error("العقد غير موجود.");

      // 1. Delete associated installments
      await tx.installment.deleteMany({
        where: { contractId: contractId },
      });

      // 2. Delete the contract itself
      await tx.contract.delete({
        where: { id: contractId },
      });

      // 3. Set the unit back to 'available'
      await tx.unit.update({
        where: { id: contract.unitId },
        data: { status: UnitStatus.available },
      });
    });

    revalidatePath("/real-estate/contracts");
    revalidatePath("/real-estate/units");
  } catch (error) {
    console.error(`Failed to delete contract ${contractId}:`, error);
    throw new Error("فشل في حذف العقد.");
  }
}
