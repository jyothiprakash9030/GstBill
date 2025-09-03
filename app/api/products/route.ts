import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "public", "listofprodutes.json")

function readProducts() {
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw)
}

function writeProducts(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET() {
  const products = readProducts()
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const body = await req.json()
  const products = readProducts()
  products.push(body)
  writeProducts(products)
  return NextResponse.json({ success: true })
}

export async function PUT(req: Request) {
  const body = await req.json()
  const products = readProducts()
  const idx = products.findIndex((p: any) => p.id === body.id)
  if (idx >= 0) {
    products[idx] = body
    writeProducts(products)
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  let products = readProducts()
  products = products.filter((p: any) => p.id !== id)
  writeProducts(products)
  return NextResponse.json({ success: true })
}
