import db from "@/app/admin/dp/dp"
import fs from "fs/promises"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ downloadVerificationId: string }> }
) {
  const { downloadVerificationId } = await params

  const data = await db.downloadVerification.findUnique({
    where: {
      id: downloadVerificationId,
      expiresAt: { gt: new Date() },
    },
    select: {
      product: {
        select: {
          filePath: true,
          name: true,
        },
      },
    },
  })

  if (data == null) {
    return NextResponse.redirect(
      new URL("/products/download/expired", req.url)
    )
  }

  const { size } = await fs.stat(data.product.filePath)
  const file = await fs.readFile(data.product.filePath)
  const extension = data.product.filePath.split(".").pop()

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${encodeURIComponent(data.product.name)}.${extension}"`,
      "Content-Type": "application/octet-stream",
      "Content-Length": size.toString(),
      "Cache-Control": "no-store, max-age=0",
    },
  })
}