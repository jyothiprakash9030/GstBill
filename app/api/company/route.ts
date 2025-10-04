export const runtime = "edge";
import { NextResponse } from "next/server";

// GET request – read JSON from public folder
export async function GET() {
  try {
    // Fetch the static JSON from the public folder via the same origin.
    // Uses NEXT_PUBLIC_BASE_URL for prod (full URL) or defaults to relative path for local dev.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/companydetails.json`);
    // Removed cache option to avoid local dev compatibility issues; defaults to 'default' mode.
    if (!res.ok) throw new Error("File not found");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err); // Logs errors for debugging (visible in Cloudflare/Edge logs)
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