import { NextResponse } from "next/server";
import { runPartnerSettlement } from "@/services/settlements/partner";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await runPartnerSettlement(body.projectId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}