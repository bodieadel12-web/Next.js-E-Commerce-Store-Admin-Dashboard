import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
} from "react-email"
import { OrderInformation } from "./components/OrderInformation"
import React from "react"

type PurchaseReceiptEmailProps = {
  order: {
    id: string
    createdAt: Date
    pricePaidInCents: number
    downloadVerificationId: string
  }
  product: {
    name: string
    imagePath: string
    description: string
  }
}

PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    createdAt: new Date(),
    pricePaidInCents: 10000,
    downloadVerificationId: "preview-verification",
  },
  product: {
    name: "Gray T-shirt",
    description: "Some description",
    imagePath: "/products/7a64fd98-f145-4a68-b89c-073027b9b8ab-WhatsApp Image 2026-09-03 at 10.08.51 PM.jpeg",
  },
} satisfies PurchaseReceiptEmailProps

export default function PurchaseReceiptEmail({
  order,
  product,
}: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Preview>View {product.name}</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-slate-100 py-12 my-auto mx-auto">
          <Container className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md">
            <Heading className="text-2xl font-black text-slate-900 text-center m-0 mb-6 tracking-tight">
              Purchase Receipt
            </Heading>
            <OrderInformation
              order={order}
              product={product}
              downloadVerificationId={order.downloadVerificationId}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}