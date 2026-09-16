"use client"

import { userOrderExists } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/formatters"
import { Product } from "@prisma/client"
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import Image from "next/image"
import { FormEvent, useMemo, useState } from "react"
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

type CheckoutFormProps = {
  product: Product
  clientSecret: string
}

export function CheckoutForm({
  product,
  clientSecret,
}: CheckoutFormProps) {
  let imageSrc = product.imagePath
  if (imageSrc.startsWith("/http")) {
    imageSrc = imageSrc.substring(1)
  } else if (!imageSrc.startsWith("http") && !imageSrc.startsWith("/")) {
    imageSrc = `/${imageSrc}`
  }

  const options = useMemo(
    () => ({
      clientSecret,
    }),
    [clientSecret]
  )

  return (
    <div className="max-w-6xl mx-auto my-6 sm:my-12 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Product Summary Card (Sticky on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Order Summary
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Ready for Instant Access
              </span>
            </div>

            {/* Product Image */}
            <div className="relative aspect-video sm:aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {product.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(product.priceInCents / 100)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxes & Fees</span>
                <span className="text-xs text-slate-400">Included</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200/60 dark:border-slate-800 pt-3">
                <span>Total Due</span>
                <span className="text-lg text-slate-900 dark:text-slate-100">
                  {formatCurrency(product.priceInCents / 100)}
                </span>
              </div>
            </div>

            {/* Guarantee / Trust Badges */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant digital download right after payment</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Guaranteed secure payment processing</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Checkout Form Card */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl shadow-slate-100 dark:shadow-none space-y-6">
            
            <Elements options={options} stripe={stripePromise}>
              <Form
                priceInCents={product.priceInCents}
                productId={product.id}
              />
            </Elements>

          </div>
        </div>

      </div>
    </div>
  )
}

function Form({
  priceInCents,
  productId,
}: {
  priceInCents: number
  productId: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [email, setEmail] = useState<string | undefined>()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (stripe == null || elements == null) return

    if (!email) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setErrorMessage(undefined)

    try {
      const orderExists = await userOrderExists(email, productId)

      if (orderExists) {
        setErrorMessage(
          "You have already purchased this product. Try downloading it from the My Orders page"
        )
        setIsLoading(false)
        return
      }

      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(submitError.message)
        setIsLoading(false)
        return
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/stripe/purchase-success`,
        },
      })

      if (error?.type === "card_error" || error?.type === "validation_error") {
        setErrorMessage(error.message)
      } else if (error) {
        setErrorMessage("An unknown error occurred")
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Payment Details
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete your purchase safely below
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700 font-medium">
          <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          256-bit SSL
        </span>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 flex items-start gap-3 text-red-600 dark:text-red-400 text-sm leading-relaxed">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Stripe Elements */}
      <div className="space-y-4">
        <LinkAuthenticationElement
          onChange={(e) => setEmail(e.value.email)}
        />

        <PaymentElement />
      </div>

      {/* Submit Button */}
      <div className="pt-2 space-y-3">
        <Button
          type="submit"
          className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white shadow-lg shadow-slate-900/10 font-bold text-base py-6 transition-all duration-200"
          size="lg"
          disabled={stripe == null || elements == null || isLoading}
        >
          {isLoading
            ? "Purchasing..."
            : `Pay ${formatCurrency(priceInCents / 100)}`}
        </Button>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          By clicking pay, you authorize the charge to your selected payment method.
        </p>
      </div>
    </form>
  )
}