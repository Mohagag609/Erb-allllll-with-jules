"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

const ProjectSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  name: z.string().min(1, "الاسم مطلوب"),
  status: z.enum(["active", "paused", "closed"]).default("active"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  budget: z.coerce.number().optional(),
});

export async function getProjects() {
  return prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createProject(formData: FormData) {
  const parsed = ProjectSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    status: formData.get('status') || undefined,
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate') || undefined,
    budget: formData.get('budget') || undefined,
  });

  if (!parsed.success) {
    throw new Error(`Validation Error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const data = parsed.data;
  await prisma.project.create({
    data: {
      code: data.code,
      name: data.name,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget !== undefined ? new Decimal(data.budget) : undefined,
    },
  });

  revalidatePath('/projects/projects');
}