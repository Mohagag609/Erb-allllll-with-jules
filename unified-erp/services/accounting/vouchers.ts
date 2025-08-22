"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createJournalEntry, CreateJournalEntryInput } from "./journal";
import { Decimal } from "@prisma/client/runtime/library";

// This schema is for the form input
const VoucherSchema = z.object({
  kind: z.enum(["receipt", "payment"]),
  cashboxId: z.string().cuid("يجب تحديد الخزنة أو البنك"),
  amount: z.coerce.number().positive("المبلغ يجب أن يكون موجبًا"),
  date: z.coerce.date(),
  note: z.string().min(1, "البيان مطلوب"),
  // In a real app, you'd likely have a single 'partyId' and a 'partyType'
  clientId: z.string().cuid().optional(),
  supplierId: z.string().cuid().optional(),
  partnerId: z.string().cuid().optional(),
  // This is the account the user wants to affect (e.g., a specific revenue or expense account)
  targetAccountId: z.string().cuid("يجب تحديد الحساب المقابل"),
});

export async function createVoucher(input: z.infer<typeof VoucherSchema>) {
  const validation = VoucherSchema.safeParse(input);
  if (!validation.success) {
    console.error("Voucher Validation Error:", validation.error.flatten().fieldErrors);
    throw new Error("بيانات السند غير صالحة");
  }

  const { kind, cashboxId, amount, date, note, clientId, supplierId, partnerId, targetAccountId } = validation.data;

  const cashbox = await prisma.cashbox.findUnique({
    where: { id: cashboxId },
    select: { accountId: true }
  });
  if (!cashbox) {
    throw new Error("الخزنة المحددة غير موجودة.");
  }
  const cashboxAccountId = cashbox.accountId;

  const journalInput: CreateJournalEntryInput = {
    date,
    description: `[${kind === 'receipt' ? 'سند قبض' : 'سند صرف'}] - ${note}`,
    lines: [],
  };

  if (kind === "receipt") {
    // Debit the cashbox, Credit the target account
    journalInput.lines.push({ accountId: cashboxAccountId, debit: amount, credit: 0 });
    journalInput.lines.push({ accountId: targetAccountId, debit: 0, credit: amount });
  } else { // payment
    // Debit the target account, Credit the cashbox
    journalInput.lines.push({ accountId: targetAccountId, debit: amount, credit: 0 });
    journalInput.lines.push({ accountId: cashboxAccountId, debit: 0, credit: amount });
  }

  try {
    // We wrap the journal entry creation and voucher creation in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Create the journal entry first
      const journalEntry = await createJournalEntry(journalInput);

      // Then create the voucher
      await tx.voucher.create({
        data: {
          kind,
          date,
          cashboxId,
          amount: new Decimal(amount),
          note,
          clientId,
          supplierId,
          partnerId,
          // We can link the voucher to the journal entry if we add the relation to the schema
        }
      });
    });

    revalidatePath("/accounting/vouchers");
  } catch (error) {
    // The error from createJournalEntry will be more specific if it's a balance issue
    console.error("Failed to create voucher:", error);
    throw error;
  }
}

export async function getVouchers() {
    try {
        const vouchers = await prisma.voucher.findMany({
            orderBy: {
                date: 'desc'
            },
            include: {
                cashbox: true,
                client: true,
                supplier: true,
                partner: true,
            }
        });
        return vouchers;
    } catch (error) {
        console.error("Failed to fetch vouchers:", error);
        throw new Error("فشل في جلب السندات.");
    }
}
