import db from "@/app/admin/dp/dp"
import { PageHeader } from "@/app/admin/_components/PageHeader"
import { ProductForm } from "@/app/admin/products/_components/ProductForm"
import { notFound } from "next/navigation"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await db.product.findUnique({ where: { id } })

  if (product == null) return notFound()

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  )
}