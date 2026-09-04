"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition } from "react"
import { deleteUser } from "../../_actions/users"
import { useRouter } from "next/navigation"

export function DeleteDropDownItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteUser(id)
          router.refresh()
        })
      }}
      className="text-red-600 focus:bg-red-100 focus:text-red-600 cursor-pointer"
    >
      Delete
    </DropdownMenuItem>
  )
}