export const runtime = "edge"; // Edge runtime

import { NextResponse } from "next/server";

// GET reads JSON from public folder
export async function GET() {
  try {
    // Fetch the static JSON from the public folder via the same origin.
    // Uses NEXT_PUBLIC_BASE_URL for prod (full URL) or defaults to relative path for local dev.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/listofprodutes.json`, {
      cache: 'force-cache', // Optional: Caches the response for performance; change to 'no-store' if needed
    });
    if (!res.ok) throw new Error("File not found");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err); // Logs errors for debugging (visible in Cloudflare/Edge logs)
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