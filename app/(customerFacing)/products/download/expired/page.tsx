import { Button } from "@/components/ui/button"
import { Clock, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function ExpiredPage() {
  return (
    <div className="max-w-md mx-auto my-16 sm:my-24 px-4">
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl shadow-slate-100 dark:shadow-none text-center space-y-6">
        
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Download timed out
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your download link has expired for security reasons. Click below to generate a new link sent to your email.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            asChild
            size="lg"
            className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white font-bold text-base py-6 shadow-lg shadow-slate-900/10 transition-all duration-200"
          >
            <Link href="/orders" className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Get New Link
            </Link>
          </Button>
        </div>

      </div>
    </div>
  )
}