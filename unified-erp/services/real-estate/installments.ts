"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { InstallmentStatus } from "@prisma/client";
import { createJournalEntry } from "../accounting/journal";
import { Decimal } from "@prisma/client/runtime/library";

export async function getInstallments() {
  try {
    const installments = await prisma.installment.findMany({
      orderBy: {
        dueDate: "asc",
      },
      include: {
        contract: {
          include: {
            client: true,
            unit: true,
          },
        },
      },
    });
    return installments;
  } catch (error) {
    console.error("Failed to fetch installments:", error);
    throw new Error("فشل في جلب بيانات الأقساط.");
  }
}

export async function markInstallmentAsPaid(installmentId: string, cashboxId: string) {
  try {
    const installment = await prisma.installment.findUnique({
      where: { id: installmentId },
      include: { contract: true },
    });

    if (!installment) {
      throw new Error("القسط غير موجود.");
    }
    if (installment.status === InstallmentStatus.PAID) {
      throw new Error("القسط مدفوع بالفعل.");
    }

    const cashbox = await prisma.cashbox.findUnique({
        where: { id: cashboxId },
        select: { accountId: true }
    });

    if (!cashbox) {
        throw new Error("الخزنة المحددة غير موجودة.");
    }

    // This is a simplification. A real system would use the client's specific AR account.
    const accountsReceivableAccountId = "1130";

    await prisma.$transaction(async (tx) => {
      // 1. Update installment status
      await tx.installment.update({
        where: { id: installmentId },
        data: {
          status: InstallmentStatus.PAID,
          paidAt: new Date(),
        },
      });

      // 2. Create corresponding journal entry
      await createJournalEntry({
        date: new Date(),
        description: `تحصيل قسط للعقد رقم ${installment.contract.id}`,
        lines: [
          { accountId: cashbox.accountId, debit: installment.amount.toNumber(), credit: 0 }, // Dr. Cashbox
          { accountId: accountsReceivableAccountId, debit: 0, credit: installment.amount.toNumber() }, // Cr. A/R
        ],
      });
    });

    revalidatePath("/real-estate/installments");
    revalidatePath("/accounting/journal");
  } catch (error) {
    console.error(`Failed to mark installment ${installmentId} as paid:`, error);
    throw new Error("فشل في تحديث حالة القسط.");
  }
}
