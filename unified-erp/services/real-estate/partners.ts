"use server"

import prisma from "@/lib/prisma";

export async function getPartners() {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return partners;
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    throw new Error("فشل في جلب بيانات الشركاء.");
  }
}

// createPartner, updatePartner, deletePartner would be added here.
