import {Nav, NavLink} from "@/components/nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly< {
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 flex justify-center">
        <NavLink href="/admin"> Dashboard </NavLink>
        <NavLink href="/admin/products"> Products </NavLink>
        <NavLink href="/admin/users"> Customers </NavLink>
        <NavLink href="/admin/orders"> Sales </NavLink>
      </nav>
      <div className="container my-6 mx-auto px-4">{children}</div>
    </>
  );
}
