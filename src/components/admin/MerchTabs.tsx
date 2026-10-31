import Link from "next/link";

export function MerchTabs({ active, pending }: { active: "products" | "orders"; pending: number }) {
  return (
    <nav className="flex gap-2" aria-label="Merch sections">
      <Link href="/admin/merch" className="chip" aria-current={active === "products" ? "true" : undefined}>Products</Link>
      <Link href="/admin/merch/orders" className="chip" aria-current={active === "orders" ? "true" : undefined}>
        Orders {pending > 0 && <span className="rounded-full bg-orange px-2 text-xs text-night">{pending} new</span>}
      </Link>
    </nav>
  );
}
