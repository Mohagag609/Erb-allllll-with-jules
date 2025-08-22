import { NextResponse } from "next/server";
import { getMaterials, createMaterial } from "@/services/projects/materials";

export async function GET() {
  const items = await getMaterials();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = new FormData();
    form.append('name', body.name);
    form.append('unit', body.unit);
    if (body.defaultUnitCost !== undefined) form.append('defaultUnitCost', String(body.defaultUnitCost));
    await createMaterial(form);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}