"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  iconColor: string; // icon color when inactive
  tile: string; // icon tile background when inactive
};

const mainMenu: MenuItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, iconColor: "text-blue-600", tile: "bg-blue-50" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, iconColor: "text-indigo-600", tile: "bg-indigo-50" },
  { label: "Products", href: "/admin/products", icon: Package, iconColor: "text-amber-600", tile: "bg-amber-50" },
  { label: "Categories", href: "/admin/categories", icon: Tags, iconColor: "text-orange-600", tile: "bg-orange-50" },
  { label: "Customers", href: "/admin/customers", icon: Users, iconColor: "text-purple-600", tile: "bg-purple-50" },
];

const managementMenu: MenuItem[] = [
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse, iconColor: "text-teal-600", tile: "bg-teal-50" },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, iconColor: "text-emerald-600", tile: "bg-emerald-50" },
  { label: "Shipping", href: "/admin/shipping", icon: Truck, iconColor: "text-sky-600", tile: "bg-sky-50" },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, iconColor: "text-violet-600", tile: "bg-violet-50" },
  { label: "Reviews", href: "/admin/reviews", icon: FileText, iconColor: "text-pink-600", tile: "bg-pink-50" },
];

const systemMenu: MenuItem[] = [
  { label: "Settings", href: "/admin/settings", icon: Settings, iconColor: "text-slate-600", tile: "bg-slate-100" },
];

const sections = [
  { title: "Main", items: mainMenu },
  { title: "Management", items: managementMenu },
  { title: "System", items: systemMenu },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 pb-6 pt-6">
        <Link href="/admin" onClick={onNavigate} className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-200/60 transition-transform duration-200 group-hover:scale-105">
            <Box size={21} strokeWidth={2.1} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-bold tracking-tight text-slate-900">ShopAdmin</h1>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">Ecommerce Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3.5 pb-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-medium text-slate-400">{section.title}</p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/60"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        active ? "bg-white/20 text-white" : `${item.tile} ${item.iconColor}`
                      }`}
                    >
                      <Icon size={17} strokeWidth={2} />
                    </span>

                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* View Store */}
      <div className="px-3.5 pb-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <ShoppingBag size={16} />
          View Store
        </Link>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-white shadow-[4px_0_24px_-12px_rgba(15,23,42,0.12)] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative h-full w-[280px] bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin menu"
              className="absolute right-4 top-6 rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
            >
              <X size={18} />
            </button>

            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300/50 transition-all duration-200 hover:scale-105 lg:hidden"
      >
        <LayoutDashboard size={19} strokeWidth={2} />
      </button>
    </>
  );
}