"use server"

import db from "@/app/admin/dp/dp"
import { z } from "zod"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"

const fileSchema = z.custom<File>(
  val => val != null && typeof val === "object" && "size" in val,
  { message: "Required" }
)

const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/"),
  "Must be an image"
)

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, "Required"),
  image: imageSchema.refine(file => file.size > 0, "Required"),
})

const editSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.optional(),
  image: imageSchema.optional(),
})

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData))
  if (result.success === false) {
    return result.error.flatten().fieldErrors
  }

  const data = result.data

  // Upload file to Vercel Blob
  const fileBlob = await put(data.file.name, data.file, { access: "public" })
  const filePath = fileBlob.url

  // Upload image to Vercel Blob
  const imageBlob = await put(data.image.name, data.image, { access: "public" })
  const imagePath = imageBlob.url

  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  })

  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/admin/products")

  redirect("/admin/products")
}

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData))
  if (result.success === false) {
    return result.error.flatten().fieldErrors
  }

  const data = result.data
  const product = await db.product.findUnique({ where: { id } })

  if (product == null) return notFound()

  let filePath = product.filePath
  if (data.file != null && data.file.size > 0) {
    await del(product.filePath).catch(() => {})
    const fileBlob = await put(data.file.name, data.file, { access: "public" })
    filePath = fileBlob.url
  }

  let imagePath = product.imagePath
  if (data.image != null && data.image.size > 0) {
    await del(product.imagePath).catch(() => {})
    const imageBlob = await put(data.image.name, data.image, { access: "public" })
    imagePath = imageBlob.url
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  })

  revalidatePath("/")
  revalidatePath("/admin/products")

  redirect("/admin/products")
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  })

  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/admin/products")
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } })

  if (product == null) return notFound()

  await del(product.filePath).catch(() => {})
  await del(product.imagePath).catch(() => {})

  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/admin/products")
}