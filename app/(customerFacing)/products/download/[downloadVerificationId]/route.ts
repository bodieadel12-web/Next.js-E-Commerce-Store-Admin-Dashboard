import db from "@/app/admin/dp/dp"
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

  // Fetch the file from Vercel Blob URL
  const fileResponse = await fetch(data.product.filePath)

  if (!fileResponse.ok || !fileResponse.body) {
    return new NextResponse("File not found on storage", { status: 404 })
  }

  const extension = data.product.filePath.split(".").pop() || "bin"

  return new NextResponse(fileResponse.body, {
    headers: {
      "Content-Disposition": `attachment; filename="${encodeURIComponent(data.product.name)}.${extension}"`,
      "Content-Type": fileResponse.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": "no-store, max-age=0",
    },
  })
}