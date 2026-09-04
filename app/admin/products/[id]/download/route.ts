import db from "@/app/admin/dp/dp"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params

  if (!id) return notFound()

  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  })

  if (product == null) return notFound()

  try {
    const { size } = await fs.stat(product.filePath)
    const file = await fs.readFile(product.filePath)
    const extension = product.filePath.split(".").pop()

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
        "Content-Length": size.toString(),
      },
    })
  } catch {
    return notFound()
  }
}