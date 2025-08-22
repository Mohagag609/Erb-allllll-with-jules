"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

const JournalLineInputSchema = z.object({
  accountId: z.string().cuid(),
  debit: z.number().min(0),
  credit: z.number().min(0),
}).refine(data => !(data.debit > 0 && data.credit > 0), {
  message: "لا يمكن أن يحتوي السطر على مدين ودائن معًا.",
});

export const CreateJournalEntrySchema = z.object({
  date: z.coerce.date(),
  description: z.string().min(1, "الوصف مطلوب"),
  lines: z.array(JournalLineInputSchema).min(2, "يجب أن يحتوي القيد على سطرين على الأقل"),
});

export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntrySchema>;

export async function createJournalEntry(input: CreateJournalEntryInput) {
  const validation = CreateJournalEntrySchema.safeParse(input);
  if (!validation.success) {
    console.error("Journal Entry Validation Error:", validation.error.flatten().fieldErrors);
    throw new Error(`بيانات القيد غير صالحة.`);
  }

  const { date, description, lines } = validation.data;

  let totalDebit = new Decimal(0);
  let totalCredit = new Decimal(0);

  for (const line of lines) {
    totalDebit = totalDebit.add(new Decimal(line.debit));
    totalCredit = totalCredit.add(new Decimal(line.credit));
  }

  if (totalDebit.isZero() || !totalDebit.equals(totalCredit)) {
    throw new Error(
      `القيد غير متوازن. إجمالي المدين: ${totalDebit}, إجمالي الدائن: ${totalCredit}`
    );
  }

  try {
    const newEntry = await prisma.$transaction(async (tx: any) => {
      const journalEntry = await tx.journalEntry.create({
        data: {
          date: date,
          description: description,
          posted: true, // Assuming direct posting
          createdBy: "system", // Placeholder - replace with actual user ID from session
        },
      });

      const linesToCreate = lines.map(line => ({
        ...line,
        entryId: journalEntry.id,
        debit: new Decimal(line.debit),
        credit: new Decimal(line.credit),
      }));

      await tx.journalLine.createMany({
        data: linesToCreate,
      });

      return journalEntry;
    });

    revalidatePath("/accounting/journal");
    return newEntry;

  } catch (error) {
    console.error("Failed to create journal entry:", error);
    throw new Error("فشل في إنشاء قيد اليومية.");
  }
}

export async function getJournalEntries() {
    try {
        const entries = await prisma.journalEntry.findMany({
            orderBy: {
                date: 'desc'
            },
            include: {
                lines: {
                    include: {
                        account: true
                    }
                }
            }
        });
        return entries;
    } catch (error) {
        console.error("Failed to fetch journal entries:", error);
        throw new Error("فشل في جلب قيود اليومية.");
    }
}
