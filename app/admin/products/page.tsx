import { Button } from "@/components/ui/button"
import { PageHeader } from "../_components/PageHeader"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import db from "../dp/dp"
import {
  CheckCircle2,
  MoreVertical,
  XCircle,
  Plus,
  Download,
  Edit,
  PackageOpen,
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from "./_components/ProductActions"

export default function AdminProductsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader>Products</PageHeader>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your store catalog, pricing, and availability.
          </p>
        </div>
        <Button
          asChild
          className="rounded-xl shadow-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 gap-2 font-medium transition-all"
        >
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </Button>
      </div>
      <ProductsTable />
    </div>
  )
}

async function ProductsTable() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: { select: { orders: true } },
    },
    orderBy: { name: "asc" },
  })

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] text-center flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
          <PackageOpen className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
            No products found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            You haven't added any products to your catalog yet.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="mt-2 rounded-xl border-slate-200 dark:border-slate-800"
        >
          <Link href="/admin/products/new">Add First Product</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
          <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
            <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5">
              Product Name
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5">
              Price
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5">
              Orders
            </TableHead>
            <TableHead className="w-[60px] text-right py-3.5">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors border-slate-100 dark:border-slate-800"
            >
              {/* Status Badge */}
              <TableCell className="py-4">
                {product.isAvailableForPurchase ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50">
                    <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    Draft
                  </span>
                )}
              </TableCell>

              {/* Product Name */}
              <TableCell className="font-semibold text-slate-900 dark:text-slate-100 py-4">
                {product.name}
              </TableCell>

              {/* Price */}
              <TableCell className="font-medium text-slate-700 dark:text-slate-300 py-4">
                {formatCurrency(product.priceInCents / 100)}
              </TableCell>

              {/* Orders Count Badge */}
              <TableCell className="py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {formatNumber(product._count.orders)}
                </span>
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
                    className="w-44 rounded-xl border-slate-200 dark:border-slate-800 shadow-lg"
                  >
                    <DropdownMenuItem>
                      <a
                        download
                        href={`/admin/products/${product.id}/download`}
                        className="flex items-center gap-2 cursor-pointer text-xs font-medium w-full"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex items-center gap-2 cursor-pointer text-xs font-medium w-full"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <ActiveToggleDropdownItem
                      id={product.id}
                      isAvailableForPurchase={product.isAvailableForPurchase}
                    />
                    <DropdownMenuSeparator />
                    <DeleteDropdownItem
                      id={product.id}
                      disabled={product._count.orders > 0}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}