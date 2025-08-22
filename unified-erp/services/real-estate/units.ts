"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema for creating/updating a unit
const UnitSchema = z.object({
  number: z.string().min(1, "رقم الوحدة مطلوب"),
  type: z.string().min(1, "نوع الوحدة مطلوب"),
  area: z.number().min(1, "المساحة مطلوبة"),
  price: z.number().min(0, "السعر يجب أن يكون موجب"),
  status: z.enum(["available", "sold", "reserved"]),
  location: z.string().optional(),
  description: z.string().optional(),
});

export async function getUnits() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return units;
  } catch (error) {
    console.error("Failed to fetch units:", error);
    throw new Error("فشل في جلب بيانات الوحدات.");
  }
}

export async function createUnit(formData: FormData) {
  const validatedFields = UnitSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    area: Number(formData.get("area")),
    price: Number(formData.get("price")),
  });

  if (!validatedFields.success) {
    throw new Error(`Validation Error: ${validatedFields.error.flatten().fieldErrors}`);
  }

  try {
    const unit = await prisma.unit.create({
      data: validatedFields.data,
    });
    revalidatePath("/real-estate/units");
    return unit;
  } catch (error) {
    console.error("Failed to create unit:", error);
    throw new Error("فشل في إنشاء الوحدة.");
  }
}

// Function for creating sample units (accepts object instead of FormData)
export async function createSampleUnit(unitData: {
  number: string;
  type: string;
  area: number;
  price: number;
  status: "available" | "sold" | "reserved";
  location: string;
}) {
  const validatedFields = UnitSchema.safeParse(unitData);

  if (!validatedFields.success) {
    throw new Error(`Validation Error: ${validatedFields.error.flatten().fieldErrors}`);
  }

  try {
    const unit = await prisma.unit.create({
      data: validatedFields.data,
    });
    revalidatePath("/real-estate/units");
    revalidatePath("/dashboard");
    return unit;
  } catch (error) {
    console.error("Failed to create sample unit:", error);
    throw new Error("فشل في إنشاء الوحدة التجريبية.");
  }
}
