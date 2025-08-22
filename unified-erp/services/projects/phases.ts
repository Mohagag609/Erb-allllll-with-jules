"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const PhaseSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  progressPct: z.coerce.number().min(0).max(100).optional(),
});

export async function getPhases(projectId?: string) {
  return prisma.phase.findMany({ where: { projectId: projectId || undefined } });
}

export async function createPhase(formData: FormData) {
  const parsed = PhaseSchema.safeParse({
    projectId: formData.get('projectId'),
    name: formData.get('name'),
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    progressPct: formData.get('progressPct') || undefined,
  });
  if (!parsed.success) throw new Error('بيانات المرحلة غير صالحة');

  await prisma.phase.create({ data: parsed.data });
  revalidatePath('/projects/phases');
}