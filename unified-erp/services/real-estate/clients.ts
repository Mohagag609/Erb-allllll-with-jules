"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema for creating/updating a client
const ClientSchema = z.object({
  name: z.string().min(3, "الاسم مطلوب"),
  phone: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional(),
});

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return clients;
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    throw new Error("فشل في جلب بيانات العملاء.");
  }
}

export async function createClient(formData: FormData) {
  const validatedFields = ClientSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    // In a real app, you'd return these errors to the form
    throw new Error(`Validation Error: ${validatedFields.error.flatten().fieldErrors}`);
  }

  try {
    const client = await prisma.client.create({
      data: validatedFields.data,
    });
    revalidatePath("/real-estate/clients"); // Refresh the data on the clients page
    return client;
  } catch (error) {
    console.error("Failed to create client:", error);
    throw new Error("فشل في إنشاء العميل.");
  }
}

// Function for creating sample clients (accepts object instead of FormData)
export async function createSampleClient(clientData: {
  name: string;
  phone: string;
  email: string;
  address: string;
}) {
  const validatedFields = ClientSchema.safeParse(clientData);

  if (!validatedFields.success) {
    throw new Error(`Validation Error: ${validatedFields.error.flatten().fieldErrors}`);
  }

  try {
    const client = await prisma.client.create({
      data: validatedFields.data,
    });
    revalidatePath("/real-estate/clients");
    revalidatePath("/dashboard");
    return client;
  } catch (error) {
    console.error("Failed to create sample client:", error);
    throw new Error("فشل في إنشاء العميل التجريبي.");
  }
}

// Note: updateClient and deleteClient would be added here following a similar pattern.
