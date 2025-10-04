export const runtime = "edge"; // Edge runtime

import { NextResponse } from "next/server";

// GET reads JSON from public folder
export async function GET() {
  try {
    const res = await fetch(new URL("../../../public/listofprodutes.json", import.meta.url));
    if (!res.ok) throw new Error("File not found");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 });
  }
}

// POST cannot write in Edge runtime
export async function POST() {
  return NextResponse.json(
    { error: "Cannot write in Edge runtime" },
    { status: 500 }
  );
}

// PUT cannot update in Edge runtime
export async function PUT() {
  return NextResponse.json(
    { error: "Cannot update in Edge runtime" },
    { status: 500 }
  );
}

// DELETE cannot delete in Edge runtime
export async function DELETE() {
  return NextResponse.json(
    { error: "Cannot delete in Edge runtime" },
    { status: 500 }
  );
}
