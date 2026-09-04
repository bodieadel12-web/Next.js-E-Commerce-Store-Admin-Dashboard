import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from "react-email"
import { OrderInformation } from "./components/OrderInformation"
import React from "react"

type OrderHistoryEmailProps = {
  orders: {
    id: string
    pricePaidInCents: number
    createdAt: Date
    downloadVerificationId: string
    product: {
      name: string
      imagePath: string
      description: string
    }
  }[]
}

OrderHistoryEmail.PreviewProps = {
  orders: [
    {
      id: "preview-order-1",
      createdAt: new Date(),
      pricePaidInCents: 2000,
      downloadVerificationId: "preview-verification-1",
      product: {
        name: "Gray T-shirt",
        description: "Some description",
        imagePath: "/products/7a64fd98-f145-4a68-b89c-073027b9b8ab-WhatsApp Image 2026-09-03 at 10.08.51 PM.jpeg",
      },
    },
    {
      id: "preview-order-2",
      createdAt: new Date(),
      pricePaidInCents: 2500,
      downloadVerificationId: "preview-verification-2",
      product: {
        name: "Burgundy T-shirt",
        description: "Some other desc",
        imagePath: "/products/burgundy.jpeg",
      },
    },
  ],
} satisfies OrderHistoryEmailProps

export default function OrderHistoryEmail({ orders }: OrderHistoryEmailProps) {
  return (
    <Html>
      <Preview>Order History & Downloads</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-slate-100 py-12 my-auto mx-auto">
          <Container className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md">
            <Heading className="text-2xl font-black text-slate-900 text-center m-0 mb-2 tracking-tight">
              Order History
            </Heading>
            <Text className="text-xs text-slate-500 text-center m-0 mb-6">
              Here is your requested purchase history and download links.
            </Text>

            {orders.map((order) => (
              <OrderInformation
                key={order.id}
                order={order}
                product={order.product}
                downloadVerificationId={order.downloadVerificationId}
              />
            ))}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}