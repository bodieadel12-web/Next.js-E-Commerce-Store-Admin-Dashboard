import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import db from "@/app/admin/dp/dp"
import { formatCurrency } from "@/lib/formatters"
import { ShoppingCart, PackageOpen } from "lucide-react"
import { Suspense } from "react"

function getProducts() {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  })
}

export default function ProductsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          All Products
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Explore our complete collection of available products and digital items.
        </p>
      </div>

      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsGrid />
      </Suspense>
    </main>
  )
}

async function ProductsGrid() {
  const products = await getProducts()

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-100 dark:border-slate-800 shadow-sm text-center flex flex-col items-center justify-center space-y-3 my-8">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
          <PackageOpen className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
            No products available
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Check back later for new items in our store catalog.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}

type ProductCardProps = {
  id: string
  name: string
  priceInCents: number
  description: string
  imagePath: string
}

function ProductCard({
  id,
  name,
  priceInCents,
  description,
  imagePath,
}: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 p-3 flex items-center justify-center">
        <Image
          src={imagePath}
          alt={name}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800 shadow-sm text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 z-10">
          {formatCurrency(priceInCents / 100)}
        </div>
      </div>

      <div className="flex-1 p-5 space-y-2 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Button
          asChild
          className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white shadow-sm font-medium transition-all duration-200 gap-2"
        >
          <Link href={`/products/${id}/purchase`}>
            <ShoppingCart className="w-4 h-4" />
            Purchase
          </Link>
        </Button>
      </div>
    </div>
  )
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4"
        >
          <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      ))}
    </div>
  )
}