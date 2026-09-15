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
        },
      },
    },
  })

  if (data == null) {
    return NextResponse.redirect(
      new URL("/products/download/expired", req.url)
    )
  }

  return NextResponse.redirect(data.product.filePath)
}