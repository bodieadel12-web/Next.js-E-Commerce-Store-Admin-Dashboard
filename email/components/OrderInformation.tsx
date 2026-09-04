import { formatCurrency } from "@/lib/formatters"
import {
  Button,
  Column,
  Img,
  Row,
  Section,
  Text,
} from "react-email"

type OrderInformationProps = {
  order: {
    id: string
    createdAt: Date
    pricePaidInCents: number
  }
  product: {
    imagePath: string
    name: string
    description: string
  }
  downloadVerificationId: string
}

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" })

export function OrderInformation({
  order,
  product,
  downloadVerificationId,
}: OrderInformationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
  const imageUrl = product.imagePath.startsWith("http")
    ? product.imagePath
    : `${baseUrl}${product.imagePath.startsWith("/") ? "" : "/"}${product.imagePath}`

  return (
    <Section className="my-6 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <Section className="bg-slate-50 px-6 py-3 border-b border-slate-200">
        <Row>
          <Column>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">
              Order ID
            </Text>
            <Text className="text-xs font-semibold text-slate-700 m-0 mt-0.5">
              {order.id}
            </Text>
          </Column>
          <Column>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">
              Purchased On
            </Text>
            <Text className="text-xs font-semibold text-slate-700 m-0 mt-0.5">
              {dateFormatter.format(order.createdAt)}
            </Text>
          </Column>
          <Column className="text-right">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">
              Price Paid
            </Text>
            <Text className="text-xs font-bold text-slate-900 m-0 mt-0.5">
              {formatCurrency(order.pricePaidInCents / 100)}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section className="p-6">
        <Img
          width="160"
          alt={product.name}
          src={imageUrl}
          className="rounded-xl object-cover h-40 mx-auto mb-4 border border-slate-100"
        />
        <Text className="text-base font-bold text-slate-900 m-0 mb-1">
          {product.name}
        </Text>
        <Text className="text-xs text-slate-500 m-0 mb-5 leading-relaxed">
          {product.description}
        </Text>
        <Section className="text-center">
          <Button
            href={`${baseUrl}/products/download/${downloadVerificationId}`}
            className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-xl inline-block"
          >
            Download Product
          </Button>
        </Section>
      </Section>
    </Section>
  )
}