import db from "@/app/admin/dp/dp"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"
import { revalidatePath } from "next/cache"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const resend = new Resend(process.env.RESEND_API_KEY as string)

export async function POST(req: NextRequest) {
  try {
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const productId = paymentIntent.metadata?.productId
      const pricePaidInCents = paymentIntent.amount

      let email: string | undefined =
        paymentIntent.receipt_email ||
        paymentIntent.metadata?.email

      if (!email && paymentIntent.latest_charge) {
        const charge = await stripe.charges.retrieve(
          paymentIntent.latest_charge as string
        )
        email = charge.billing_details?.email || undefined
      }

      if (!productId || !email || pricePaidInCents == null) {
        console.error("Missing product, email, or price:", { productId, email, pricePaidInCents })
        return new NextResponse("Bad Request", { status: 400 })
      }

      const product = await db.product.findUnique({ where: { id: productId } })

      if (product == null) {
        console.error("Product not found:", productId)
        return new NextResponse("Bad Request", { status: 400 })
      }

      const userFields = {
        email,
        orders: { create: { productId, pricePaidInCents } },
      }

      const user = await db.user.upsert({
        where: { email },
        create: userFields,
        update: userFields,
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })

      const order = user.orders[0]

      const downloadVerification = await db.downloadVerification.create({
        data: {
          productId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })

      try {
        const { data, error } = await resend.emails.send({
          from: `Support <${process.env.SENDER_EMAIL}>`,
          to: email,
          subject: "Order Confirmation",
          react: (
            <PurchaseReceiptEmail
              order={{
                id: order.id,
                createdAt: order.createdAt,
                pricePaidInCents: order.pricePaidInCents,
                downloadVerificationId: downloadVerification.id,
              }}
              product={{
                name: product.name,
                imagePath: product.imagePath,
                description: product.description,
              }}
            />
          ),
        })

        if (error) {
          console.error("Resend API Error:", error)
        } else {
          console.log("Email sent successfully! ID:", data?.id)
        }
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr)
      }

      revalidatePath("/")
      revalidatePath("/products")
    }

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    console.error("Webhook Verification Error:", err)
    return new NextResponse("Webhook Error", { status: 400 })
  }
}