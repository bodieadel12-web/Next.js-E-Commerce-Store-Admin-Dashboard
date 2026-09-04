"use server"

import db from "@/app/admin/dp/dp"
import { Resend } from "resend"
import { z } from "zod"
import OrderHistoryEmail from "@/email/OrderHistory"
import crypto from "crypto"

if (!globalThis.crypto) {
  globalThis.crypto = crypto as any
}

const emailSchema = z.string().email("Invalid email address")
const resend = new Resend(process.env.RESEND_API_KEY as string)

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"))

  if (result.success === false) {
    return { error: "Invalid email address" }
  }

  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  })

  if (user == null) {
    return {
      message:
        "Check your email to view your order history and download your products.",
    }
  }

  const orders = await Promise.all(
    user.orders.map(async order => {
      const downloadVerification = await db.downloadVerification.create({
        data: {
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          productId: order.product.id,
        },
      })

      return {
        ...order,
        downloadVerificationId: downloadVerification.id,
      }
    })
  )

  const { error } = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Order History",
    react: <OrderHistoryEmail orders={orders} />,
  })

  if (error) {
    return {
      error: "There was an error sending your email. Please try again.",
    }
  }

  return {
    message:
      "Check your email to view your order history and download your products.",
  }
}