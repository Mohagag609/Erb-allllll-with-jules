import { NextResponse } from "next/server";
import { getMaterialMoves, createMaterialMove } from "@/services/projects/material-moves";

export async function GET() {
  const items = await getMaterialMoves();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = new FormData();
    form.append('projectId', body.projectId);
    form.append('materialId', body.materialId);
    form.append('type', body.type);
    form.append('qty', String(body.qty));
    form.append('unitCost', String(body.unitCost));
    form.append('date', new Date(body.date).toISOString());
    if (body.phaseId) form.append('phaseId', body.phaseId);
    if (body.note) form.append('note', body.note);
    await createMaterialMove(form);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}