import {Nav, NavLink} from "@/components/nav";

export const dynamic = "force-dynamic";

export default function Layout({
  children,
}: Readonly< {
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 flex justify-center">
        <NavLink href="/"> Home </NavLink>
        <NavLink href="/products"> Products </NavLink>
        <NavLink href="/orders"> My Orders </NavLink>
      </nav>
      <div className="container my-6 mx-auto px-4">{children}</div>
    </>
  );
}
