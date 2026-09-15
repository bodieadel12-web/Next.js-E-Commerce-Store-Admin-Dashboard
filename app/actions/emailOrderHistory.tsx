"use server"
import db from "@/app/admin/dp/dp"
import { Resend } from "resend"
import OrderHistoryEmail from "@/email/OrderHistory"

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build")

export async function userOrderExists(email: string, productId: string) {
  return (
    (await db.order.findFirst({
      where: { user: { email }, productId },
      select: { id: true },
    })) != null
  )
}

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; message?: string }> {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Please provide a valid email address." }
  }

  const user = await db.user.findUnique({
    where: { email },
    select: {
      email: true,
      orders: {
        select: {
          id: true,
          pricePaidInCents: true,
          createdAt: true,
          productId: true,
          product: {
            select: {
              name: true,
              imagePath: true,
              description: true,
            },
          },
          downloadVerifications: {
            select: { id: true },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        } as any,
      },
    },
  })

  if (user == null) {
    return { message: "Check your email for your order history." }
  }

  const orders = user.orders.map((order: any) => ({
    ...order,
    downloadVerificationId: order.downloadVerifications?.[0]?.id || "",
  }))

  try {
    const { error } = await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Order History",
      react: <OrderHistoryEmail orders={orders} />,
    })

    if (error) {
      return { error: "Failed to send email. Please try again." }
    }
  } catch (err) {
    return { error: "An unexpected error occurred." }
  }

  return {
    message: "Check your email for your order history and download links.",
  }
}