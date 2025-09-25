export const runtime = "nodejs";

import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "public", "bankdetails.json")

// GET request (fetch data)
export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8")
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json({}, { status: 404 })
  }
}

// POST request (save/update data)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf-8")
    return NextResponse.json({ success: true, message: "Bank details saved" })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

// DELETE request (delete file)
export async function DELETE() {
  try {
    await fs.unlink(filePath)
    return NextResponse.json({ success: true, message: "Bank details deleted" })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
