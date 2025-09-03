export const runtime = "edge";

import { NextResponse } from "next/server";

export async function GET(request: Request, context: { env: { BANK_KV: KVNamespace } }) {
  const data = await context.env.BANK_KV.get("products", "json");
  return NextResponse.json(data || []);
}

export async function POST(request: Request, context: { env: { BANK_KV: KVNamespace } }) {
  const body = await request.json();
  await context.env.BANK_KV.put("products", JSON.stringify(body));
  return NextResponse.json({ success: true });
}
