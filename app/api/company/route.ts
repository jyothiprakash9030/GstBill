export const runtime = "edge";
import { NextResponse } from "next/server";

// GET request – read JSON from public folder
export async function GET() {
  try {
    const res = await fetch(new URL("../../../public/companydetails.json", import.meta.url));
    if (!res.ok) throw new Error("File not found");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 });
  }
}

// POST request – Edge cannot write files
export async function POST() {
  return NextResponse.json(
    { error: "Cannot write in Edge runtime" },
    { status: 500 }
  );
}

// DELETE request – Edge cannot delete files
export async function DELETE() {
  return NextResponse.json(
    { error: "Cannot delete in Edge runtime" },
    { status: 500 }
  );
}
