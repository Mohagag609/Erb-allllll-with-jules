"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema for creating/updating a contract
const ContractSchema = z.object({
  clientId: z.string().min(1, "العميل مطلوب"),
  unitId: z.string().min(1, "الوحدة مطلوبة"),
  number: z.string().min(1, "رقم العقد مطلوب"),
  startDate: z.date(),
  endDate: z.date(),
  totalAmount: z.number().min(0, "إجمالي المبلغ يجب أن يكون موجب"),
  downPayment: z.number().min(0, "الدفعة الأولى يجب أن تكون موجبة"),
  monthlyPayment: z.number().min(0, "القسط الشهري يجب أن يكون موجب"),
  status: z.enum(["draft", "active", "completed", "cancelled"]),
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
  const validatedFields = ContractSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    clientId: formData.get("clientId") as string,
    unitId: formData.get("unitId") as string,
    startDate: new Date(formData.get("startDate") as string),
    endDate: new Date(formData.get("endDate") as string),
    totalAmount: Number(formData.get("totalAmount")),
    downPayment: Number(formData.get("downPayment")),
    monthlyPayment: Number(formData.get("monthlyPayment")),
  });

  if (!validatedFields.success) {
    throw new Error(`Validation Error: ${validatedFields.error.flatten().fieldErrors}`);
  }

  const { clientId, unitId, totalAmount, downPayment, monthlyPayment } = validatedFields.data;
  const months = Math.ceil((totalAmount - downPayment) / monthlyPayment);
  const installmentAmount = (totalAmount - downPayment) / months;

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const contract = await tx.contract.create({
        data: validatedFields.data,
      });

      // Create installments
      const installments = [];
      for (let i = 1; i <= months; i++) {
        const dueDate = new Date(validatedFields.data.startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        installments.push({
          contractId: contract.id,
          number: i,
          amount: installmentAmount,
          dueDate: dueDate,
          status: "pending",
        });
      }

      await tx.installment.createMany({
        data: installments,
      });

      return contract;
    });

    revalidatePath("/real-estate/contracts");
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
  number: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  downPayment: number;
  monthlyPayment: number;
  status: "draft" | "active" | "completed" | "cancelled";
}) {
  const validatedFields = ContractSchema.safeParse(contractData);

  if (!validatedFields.success) {
    throw new Error(`Validation Error: ${validatedFields.error.flatten().fieldErrors}`);
  }

  const { clientId, unitId, totalAmount, downPayment, monthlyPayment } = validatedFields.data;
  const months = Math.ceil((totalAmount - downPayment) / monthlyPayment);
  const installmentAmount = (totalAmount - downPayment) / months;

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const contract = await tx.contract.create({
        data: validatedFields.data,
      });

      // Create installments
      const installments = [];
      for (let i = 1; i <= months; i++) {
        const dueDate = new Date(validatedFields.data.startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        installments.push({
          contractId: contract.id,
          number: i,
          amount: installmentAmount,
          dueDate: dueDate,
          status: "pending",
        });
      }

      await tx.installment.createMany({
        data: installments,
      });

      return contract;
    });

    revalidatePath("/real-estate/contracts");
    revalidatePath("/dashboard");
    return result;
  } catch (error) {
    console.error("Failed to create sample contract:", error);
    throw new Error("فشل في إنشاء العقد التجريبي.");
  }
}
