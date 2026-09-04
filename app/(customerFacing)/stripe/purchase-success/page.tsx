import db from "@/app/admin/dp/dp"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/formatters"
import { CheckCircle2, Download, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; payment_intent_client_secret?: string }>
}) {
  const resolvedParams = await searchParams
  const paymentIntentId =
    resolvedParams.payment_intent ||
    resolvedParams.payment_intent_client_secret?.split("_secret_")[0]

  if (!paymentIntentId) return notFound()

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (paymentIntent.metadata.productId == null) return notFound()

  const product = await db.product.findUnique({
    where: { id: paymentIntent.metadata.productId },
  })

  if (product == null) return notFound()

  const isSuccess = paymentIntent.status === "succeeded"

  return (
    <div className="max-w-2xl mx-auto my-12 sm:my-16 px-4">
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl shadow-slate-100 dark:shadow-none text-center space-y-8">
        
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {isSuccess ? "Purchase completed successfully!" : "Error!"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isSuccess
                ? "Thank you for your order. Your product is ready for download."
                : "Something went wrong with your payment process."}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-5 text-left">
          <div className="relative aspect-video sm:aspect-square w-full sm:w-32 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
            <Image
              src={product.imagePath.startsWith("/") ? product.imagePath : `/${product.imagePath}`}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-2 flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate">
                {product.name}
              </h2>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-sm">
                {formatCurrency(product.priceInCents / 100)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            asChild
            size="lg"
            className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white font-bold text-base py-6 shadow-lg shadow-slate-900/10 transition-all duration-200"
          >
            {isSuccess ? (
              <a href={`/products/download/${product.id}`}>
                <Download className="w-5 h-5 mr-2 inline" />
                Download Product
              </a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>

          <div className="pt-2">
            <Button
              variant="ghost"
              asChild
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <Link href="/orders" className="flex items-center gap-1 justify-center">
                View in My Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}