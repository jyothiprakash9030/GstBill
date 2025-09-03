export const runtime = "edge";

import { NextResponse } from "next/server";

// Cloudflare Pages provides bindings via env
export async function GET(request: Request, context: { env: { BANK_KV: KVNamespace } }) {
  const data = await context.env.BANK_KV.get("bankdetails", "json");
  return NextResponse.json(data || {});
}

export async function POST(request: Request, context: { env: { BANK_KV: KVNamespace } }) {
  const body = await request.json();
  await context.env.BANK_KV.put("bankdetails", JSON.stringify(body));
  return NextResponse.json({ success: true });
}
