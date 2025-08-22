"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

const MaterialSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  defaultUnitCost: z.coerce.number().optional(),
});

export async function getMaterials() {
  return prisma.material.findMany({ orderBy: { name: 'asc' } });
}

export async function createMaterial(formData: FormData) {
  const parsed = MaterialSchema.safeParse({
    name: formData.get('name'),
    unit: formData.get('unit'),
    defaultUnitCost: formData.get('defaultUnitCost') || undefined,
  });
  if (!parsed.success) throw new Error('بيانات المادة غير صالحة');

  await prisma.material.create({ data: { ...parsed.data, defaultUnitCost: parsed.data.defaultUnitCost !== undefined ? new Decimal(parsed.data.defaultUnitCost) : undefined } });
  revalidatePath('/projects/materials');
}