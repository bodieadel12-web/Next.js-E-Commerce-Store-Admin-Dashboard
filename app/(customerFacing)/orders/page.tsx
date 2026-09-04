"use client"

import { emailOrderHistory } from "@/actions/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, PackageSearch, CheckCircle2, AlertCircle } from "lucide-react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

export default function MyOrdersPage() {
  const [data, action] = useActionState(emailOrderHistory, {})

  return (
    <div className="max-w-md mx-auto my-16 sm:my-24 px-4">
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl shadow-slate-100 dark:shadow-none text-center space-y-6">
        
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-inner">
            <PackageSearch className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your email and we will send you your order history and download links.
            </p>
          </div>
        </div>

        <form action={action} className="space-y-4 text-left">
          {data.error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs sm:text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{data.error}</span>
            </div>
          )}
          {data.message && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{data.message}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                required
                name="email"
                id="email"
                placeholder="name@example.com"
                className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm"
              />
            </div>
          </div>

          <SubmitButton />
        </form>

      </div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white font-bold text-base py-6 shadow-lg shadow-slate-900/10 transition-all duration-200 mt-2"
    >
      {pending ? "Sending..." : "Send"}
    </Button>
  )
}