import { NextResponse } from "next/server";
import { getPhases, createPhase } from "@/services/projects/phases";

export async function GET() {
  const items = await getPhases();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = new FormData();
    form.append('projectId', body.projectId);
    form.append('name', body.name);
    if (body.startDate) form.append('startDate', new Date(body.startDate).toISOString());
    if (body.endDate) form.append('endDate', new Date(body.endDate).toISOString());
    await createPhase(form);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}