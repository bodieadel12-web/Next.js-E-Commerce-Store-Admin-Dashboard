"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ComponentProps, ReactNode } from "react"

export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="bg-slate-950 border-b border-slate-800 flex justify-center">
      {children}
    </nav>
  )
}

export function NavLink(
  props: Omit<ComponentProps<typeof Link>, "className">
) {
  const pathname = usePathname()
  const isActive = pathname === props.href

  return (
    <Link
      {...props}
      className={cn(
        "px-4 py-3 text-white font-semibold rounded-md transition-colors hover:bg-slate-800",
        isActive && "bg-white text-black pointer-events-none cursor-default"
      )}
    />
  )
}