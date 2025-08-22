import { NextResponse } from "next/server";
import { getInstallmentsForReport } from "@/services/reporting/installments";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const status = searchParams.get('status') || undefined;
  const data = await getInstallmentsForReport({
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    status,
  } as any);
  return NextResponse.json(data);
}