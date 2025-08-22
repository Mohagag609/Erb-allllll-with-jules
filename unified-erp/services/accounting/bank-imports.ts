"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

const BankImportSchema = z.object({
  date: z.coerce.date(),
  amount: z.coerce.number(),
  type: z.enum(["debit", "credit"]),
  reference: z.string().optional(),
  bankName: z.string().optional(),
  description: z.string().optional(),
});

export async function getBankImports() {
  return prisma.bankImport.findMany({ orderBy: { date: 'desc' } });
}

export async function createBankImport(formData: FormData) {
  const parsed = BankImportSchema.safeParse({
    date: formData.get('date'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    reference: formData.get('reference') || undefined,
    bankName: formData.get('bankName') || undefined,
    description: formData.get('description') || undefined,
  });

  if (!parsed.success) throw new Error('بيانات كشف البنك غير صالحة');

  await prisma.bankImport.create({ data: { ...parsed.data, amount: new Decimal(parsed.data.amount) } });
  revalidatePath('/accounting/bank-imports');
}

export async function matchInstallments(toleranceAmount = 5, toleranceDays = 7) {
  // Match CREDIT bank imports to PENDING installments with close amount/date
  const pendingInstallments = await prisma.installment.findMany({ where: { status: 'PENDING' } });
  const creditImports = await prisma.bankImport.findMany({ where: { type: 'credit', posted: false } });

  for (const imp of creditImports) {
    const match = pendingInstallments.find((inst: { amount: any; dueDate: any; id: string }) => {
      const amountDiff = Math.abs(Number(inst.amount) - Number(imp.amount));
      const dateDiff = Math.abs(new Date(inst.dueDate).getTime() - new Date(imp.date).getTime()) / (1000*60*60*24);
      return amountDiff <= toleranceAmount && dateDiff <= toleranceDays;
    });

    if (match) {
      await prisma.$transaction(async (tx: any) => {
        await tx.installment.update({ where: { id: match.id }, data: { status: 'PAID', paidAt: new Date(), matchedBankImportId: imp.id } });
        await tx.bankImport.update({ where: { id: imp.id }, data: { posted: true } });
      });
    }
  }

  revalidatePath('/accounting/bank-imports');
}