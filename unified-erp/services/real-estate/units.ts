"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UnitStatus } from "@prisma/client";

const UnitSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  type: z.string().min(2, "النوع مطلوب"),
  price: z.coerce.number().positive("يجب أن يكون السعر رقمًا موجبًا"),
  status: z.nativeEnum(UnitStatus),
  area: z.coerce.number().optional(),
  downPayment: z.coerce.number().optional(),
  reservationFees: z.coerce.number().optional(),
  commission: z.coerce.number().optional(),
  maintenance: z.coerce.number().optional(),
  garageShare: z.coerce.number().optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
});

export async function getUnits() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: true, // Include project data if available
      }
    });
    return units;
  } catch (error) {
    console.error("Failed to fetch units:", error);
    throw new Error("فشل في جلب بيانات الوحدات.");
  }
}

export async function createUnit(formData: FormData) {
  const validatedFields = UnitSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    console.error("Validation Error:", validatedFields.error.flatten().fieldErrors);
    throw new Error(`خطأ في التحقق من البيانات`);
  }

  try {
    const data = validatedFields.data;
    await prisma.unit.create({
      data: {
        ...data,
      },
    });
    revalidatePath("/real-estate/units");
  } catch (error) {
    console.error("Failed to create unit:", error);
    throw new Error("فشل في إنشاء الوحدة.");
  }
}
