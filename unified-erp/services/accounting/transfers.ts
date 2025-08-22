"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createJournalEntry } from "./journal";
import { Decimal } from "@prisma/client/runtime/library";

const TransferSchema = z.object({
  fromCashboxId: z.string().cuid(),
  toCashboxId: z.string().cuid(),
  date: z.coerce.date(),
  amount: z.coerce.number().positive(),
  note: z.string().optional(),
}).refine(d => d.fromCashboxId !== d.toCashboxId, { message: 'لا يمكن التحويل إلى نفس الخزنة' });

export async function createTransfer(formData: FormData) {
  const parsed = TransferSchema.safeParse({
    fromCashboxId: formData.get('fromCashboxId'),
    toCashboxId: formData.get('toCashboxId'),
    date: formData.get('date'),
    amount: formData.get('amount'),
    note: formData.get('note') || undefined,
  });

  if (!parsed.success) {
    throw new Error(`Validation Error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const { fromCashboxId, toCashboxId, date, amount, note } = parsed.data;

  const [fromCb, toCb] = await Promise.all([
    prisma.cashbox.findUnique({ where: { id: fromCashboxId }, select: { accountId: true } }),
    prisma.cashbox.findUnique({ where: { id: toCashboxId }, select: { accountId: true } }),
  ]);

  if (!fromCb || !toCb) throw new Error('الخزينة غير موجودة');

  await prisma.$transaction(async (tx: any) => {
    await tx.transfer.create({ data: { fromCashboxId, toCashboxId, date, amount: new Decimal(amount), note } });

    await createJournalEntry({
      date,
      description: `تحويل بين الخزن: ${fromCashboxId} -> ${toCashboxId}`,
      lines: [
        { accountId: toCb.accountId, debit: amount, credit: 0 },
        { accountId: fromCb.accountId, debit: 0, credit: amount },
      ],
    });
  });

  revalidatePath('/accounting/transfers');
}