"use server"

import prisma from "@/lib/prisma";

export async function getReturns() {
  try {
    const returns = await prisma.return.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        unit: true,
      }
    });
    return returns;
  } catch (error) {
    console.error("Failed to fetch returns:", error);
    throw new Error("فشل في جلب بيانات المرتجعات.");
  }
}

// createReturn, updateReturn, deleteReturn would be added here.
