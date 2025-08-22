"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { InvoiceType, InvoiceStatus } from "@prisma/client";
import { createJournalEntry } from "./journal";
import { Decimal } from "@prisma/client/runtime/library";

// A real schema would include invoice lines
const InvoiceSchema = z.object({
  type: z.nativeEnum(InvoiceType),
  number: z.string().min(1, "رقم الفاتورة مطلوب"),
  date: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  total: z.coerce.number().positive("المبلغ الإجمالي يجب أن يكون موجبًا"),
  clientId: z.string().cuid().optional(),
  supplierId: z.string().cuid().optional(),
  contractorId: z.string().cuid().optional(),
});

export async function createDraftInvoice(input: z.infer<typeof InvoiceSchema>) {
    const invoice = await prisma.invoice.create({
        data: {
            ...input,
            total: new Decimal(input.total),
            status: InvoiceStatus.draft,
        }
    });
    revalidatePath("/accounting/invoices");
    return invoice;
}

export async function postInvoice(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    });

    if (!invoice) throw new Error("الفاتورة غير موجودة.");
    if (invoice.status !== InvoiceStatus.draft) {
        throw new Error("يمكن فقط ترحيل الفواتير في حالة 'مسودة'.");
    }

    // These are placeholders from seed data. A real system needs a robust account mapping from settings.
    const arAccount = "1130"; // Accounts Receivable
    const apAccount = "2110"; // Accounts Payable
    const revenueAccount = "4100"; // Sales Revenue
    const expenseAccount = "5100"; // Project Costs

    let drAccountId: string;
    let crAccountId: string;

    if (invoice.type === InvoiceType.customer) {
        if (!invoice.clientId) throw new Error("فاتورة العميل يجب أن ترتبط بعميل.");
        drAccountId = arAccount;
        crAccountId = revenueAccount;
    } else { // Supplier or Contractor
        if (!invoice.supplierId && !invoice.contractorId) throw new Error("يجب ربط الفاتورة بمورد أو مقاول.");
        drAccountId = expenseAccount;
        crAccountId = apAccount;
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.invoice.update({
                where: { id: invoiceId },
                data: { status: InvoiceStatus.posted },
            });

            await createJournalEntry({
                date: invoice.date,
                description: `ترحيل فاتورة ${invoice.type === 'customer' ? 'عميل' : 'مورد/مقاول'} رقم: ${invoice.number}`,
                lines: [
                    { accountId: drAccountId, debit: invoice.total.toNumber(), credit: 0 },
                    { accountId: crAccountId, debit: 0, credit: invoice.total.toNumber() },
                ],
            });
        });

        revalidatePath("/accounting/invoices");
        revalidatePath("/accounting/journal");
    } catch (error) {
        console.error("Failed to post invoice:", error);
        throw error;
    }
}

export async function getInvoices() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: {
                date: 'desc'
            },
            include: {
                client: true,
                supplier: true,
                contractor: true,
            }
        });
        return invoices;
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        throw new Error("فشل في جلب الفواتير.");
    }
}
