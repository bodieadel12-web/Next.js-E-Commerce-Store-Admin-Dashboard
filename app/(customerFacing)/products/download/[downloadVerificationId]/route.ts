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

  // التأكد من أن الرابط سحابي وصحيح
  if (!data.product.filePath.startsWith("http")) {
    return new NextResponse("Invalid file path stored", { status: 400 })
  }

  // جلب الملف من Vercel Blob Storage
  const fileResponse = await fetch(data.product.filePath)

  if (!fileResponse.ok || !fileResponse.body) {
    return new NextResponse("File not found on storage", { status: 404 })
  }

  const extension = data.product.filePath.split(".").pop()?.split("?")[0] || "bin"
  const safeFileName = `${encodeURIComponent(data.product.name)}.${extension}`

  return new NextResponse(fileResponse.body, {
    headers: {
      "Content-Disposition": `attachment; filename="${safeFileName}"`,
      "Content-Type": fileResponse.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": "no-store, max-age=0",
    },
  })
}