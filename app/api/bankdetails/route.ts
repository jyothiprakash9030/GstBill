export const runtime = "edge"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch(new URL("../../../public/bankdetails.json", import.meta.url));
    if (!res.ok) throw new Error("File not found");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 });
  }
}

// POST & DELETE cannot update the file in Edge
export async function POST() {
  return NextResponse.json({ error: "Cannot write in Edge runtime" }, { status: 500 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Cannot delete in Edge runtime" }, { status: 500 });
}
