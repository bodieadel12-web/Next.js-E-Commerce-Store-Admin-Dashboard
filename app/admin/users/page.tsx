import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import db from "@/app/admin/dp/dp"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import { PageHeader } from "../_components/PageHeader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Users, ShoppingBag } from "lucide-react"
import { DeleteDropDownItem } from "./_components/UserActions"
import { Suspense } from "react"

function getUsers() {
  return db.user.findMany({
    select: {
      id: true,
      email: true,
      orders: { select: { pricePaidInCents: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default function UsersPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <PageHeader>Customers</PageHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View customer purchase history, order volume, and total lifetime value.
        </p>
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable />
      </Suspense>
    </div>
  )
}

async function UsersTable() {
  const users = await getUsers()

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] text-center flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
          <Users className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
            No customers found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            When customers make their first purchase, they will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
          <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5">
              Customer
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5">
              Orders
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5">
              Total Spent
            </TableHead>
            <TableHead className="w-[60px] text-right py-3.5">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {users.map((user) => {
            const totalSpent =
              user.orders.reduce((sum, o) => o.pricePaidInCents + sum, 0) / 100
            const initial = user.email ? user.email.charAt(0).toUpperCase() : "U"

            return (
              <TableRow
                key={user.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors border-slate-100 dark:border-slate-800"
              >
                {/* Customer Email with Avatar */}
                <TableCell className="py-4 font-medium text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-semibold text-xs border border-slate-200/60 dark:border-slate-700/50">
                      {initial}
                    </div>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                </TableCell>

                {/* Orders Count Badge */}
                <TableCell className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    {formatNumber(user.orders.length)}
                  </span>
                </TableCell>

                {/* Total Spent */}
                <TableCell className="py-4 font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(totalSpent)}
                </TableCell>

                {/* Actions Dropdown */}
                <TableCell className="py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors focus:outline-none">
                      <MoreVertical className="w-4 h-4" />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-xl border-slate-200 dark:border-slate-800 shadow-lg"
                    >
                      <DeleteDropDownItem id={user.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function UsersTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800" />
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}