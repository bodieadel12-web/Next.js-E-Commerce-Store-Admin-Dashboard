"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/formatters"
import { useState, useActionState } from "react"
import { addProduct, updateProduct } from "../../_actions/products"
import { useFormStatus } from "react-dom"
import { Product } from "@prisma/client"
import Image from "next/image"
import { FileText, Image as ImageIcon, Loader2 } from "lucide-react"

export function ProductForm({ product }: { product?: Product | null }) {
  const [error, action] = useActionState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    {}
  )
  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    product?.priceInCents
  )

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] p-6 sm:p-8">
      <form action={action} className="space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Product Name
          </Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            placeholder="e.g. Premium UI Kit"
            defaultValue={product?.name || ""}
            className="h-10 sm:h-11 rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-sm"
          />
          {error.name && <p className="text-xs text-rose-500">{error.name}</p>}
        </div>

        {/* Price Input & Formatted Currency */}
        <div className="space-y-2">
          <Label htmlFor="priceInCents" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Price (in Cents)
          </Label>
          <div className="flex gap-4 items-center">
            <Input
              type="number"
              id="priceInCents"
              name="priceInCents"
              required
              placeholder="1000 = $10.00"
              value={priceInCents || ""}
              onChange={e => setPriceInCents(Number(e.target.value) || undefined)}
              className="h-10 sm:h-11 rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-sm"
            />
            <div className="h-10 sm:h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-center whitespace-nowrap min-w-[100px]">
              {formatCurrency((priceInCents || 0) / 100)}
            </div>
          </div>
          {error.priceInCents && (
            <p className="text-xs text-rose-500">{error.priceInCents}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Provide a detailed description of the product..."
            defaultValue={product?.description || ""}
            className="rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-sm resize-none"
          />
          {error.description && (
            <p className="text-xs text-rose-500">{error.description}</p>
          )}
        </div>

        {/* Digital File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Product File (Digital Download)
          </Label>
          <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400 shrink-0" />
            <Input
              type="file"
              id="file"
              name="file"
              required={product == null}
              className="cursor-pointer text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white dark:file:bg-slate-100 dark:file:text-slate-900 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>
          {product != null && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Current: <span className="font-mono text-slate-700 dark:text-slate-300">{product.filePath}</span>
            </p>
          )}
          {error.file && <p className="text-xs text-rose-500">{error.file}</p>}
        </div>

        {/* Image Upload & Preview */}
        <div className="space-y-2">
          <Label htmlFor="image" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Product Preview Image
          </Label>
          <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
            <Input
              type="file"
              id="image"
              name="image"
              required={product == null}
              className="cursor-pointer text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white dark:file:bg-slate-100 dark:file:text-slate-900 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {product != null && (
            <div className="mt-3 relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <Image
                src={product.imagePath}
                fill
                alt="Product Image"
                className="object-cover"
              />
            </div>
          )}
          {error.image && <p className="text-xs text-rose-500">{error.image}</p>}
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <SubmitButton isEdit={product != null} />
        </div>
      </form>
    </div>
  )
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium transition-all shadow-sm"
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving Changes...</span>
        </div>
      ) : (
        <span>{isEdit ? "Update Product" : "Save Product"}</span>
      )}
    </Button>
  )
}