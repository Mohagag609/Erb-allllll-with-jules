"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";

const ReportFiltersSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.string().optional(), // In a real app, use z.nativeEnum(InstallmentStatus)
});

/**
 * Fetches installment data based on optional filters.
 * @param filters An object containing optional startDate, endDate, and status.
 * @returns A promise that resolves to an array of installments.
 */
export async function getInstallmentsForReport(filters: z.infer<typeof ReportFiltersSchema>) {
  const { startDate, endDate, status } = filters;

  try {
    const installments = await prisma.installment.findMany({
      where: {
        AND: [
          startDate ? { dueDate: { gte: startDate } } : {},
          endDate ? { dueDate: { lte: endDate } } : {},
          status ? { status: { equals: status as any } } : {},
        ],
      },
      include: {
        contract: {
          select: {
            id: true,
            client: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
    return installments;
  } catch (error) {
    console.error("Failed to fetch installments for report:", error);
    throw new Error("فشل في جلب بيانات تقرير الأقساط.");
  }
}
