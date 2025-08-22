"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const CashboxSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  name: z.string().min(1, "الاسم مطلوب"),
  projectId: z.string().cuid().optional(),
  accountId: z.string().min(1, "حساب الأستاذ مطلوب"),
  branch: z.string().optional(),
});

export async function getCashboxes() {
  return prisma.cashbox.findMany({
    include: { project: true, account: true },
    orderBy: { code: 'asc' },
  });
}

export async function createCashbox(formData: FormData) {
  const parsed = CashboxSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    projectId: formData.get('projectId') || undefined,
    accountId: formData.get('accountId'),
    branch: formData.get('branch') || undefined,
  });

  if (!parsed.success) {
    throw new Error(`Validation Error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  await prisma.cashbox.create({ data: parsed.data });
  revalidatePath('/accounting/cashboxes');
}