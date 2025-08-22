"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

const MoveSchema = z.object({
  projectId: z.string().cuid(),
  materialId: z.string().cuid(),
  type: z.enum(["in", "out", "adjust"]),
  qty: z.coerce.number().positive(),
  unitCost: z.coerce.number().positive(),
  date: z.coerce.date(),
  phaseId: z.string().cuid().optional(),
  note: z.string().optional(),
});

export async function getMaterialMoves(projectId?: string) {
  return prisma.materialMove.findMany({
    where: { projectId: projectId || undefined },
    orderBy: { date: 'desc' },
    include: { material: true, phase: true },
  });
}

export async function createMaterialMove(formData: FormData) {
  const parsed = MoveSchema.safeParse({
    projectId: formData.get('projectId'),
    materialId: formData.get('materialId'),
    type: formData.get('type'),
    qty: formData.get('qty'),
    unitCost: formData.get('unitCost'),
    date: formData.get('date'),
    phaseId: formData.get('phaseId') || undefined,
    note: formData.get('note') || undefined,
  });
  if (!parsed.success) throw new Error('بيانات حركة المواد غير صالحة');

  await prisma.$transaction(async (tx: any) => {
    await tx.materialMove.create({ data: { ...parsed.data, qty: new Decimal(parsed.data.qty), unitCost: new Decimal(parsed.data.unitCost) } });
    // Optional: costing journal entry placeholder
    // if (parsed.data.type === 'out') { ... }
  });

  revalidatePath('/projects/material-moves');
}