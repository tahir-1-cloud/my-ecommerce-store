"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  ChevronRight,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Star,
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
  badge?: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const sections: MenuSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0B1120] font-sans">
      {/* Soft glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

      {/* Brand */}
      <div className="relative flex h-[76px] shrink-0 items-center border-b border-white/[0.06] px-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
            <Box size={20} strokeWidth={2} />
          </div>

          <div className="leading-none">
            <h1 className="text-[16px] font-semibold tracking-tight text-white">
              ShopAdmin
            </h1>
            <p className="mt-1.5 text-[11px] font-medium text-slate-400">
              Ecommerce Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Admin navigation"
        className="relative flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => (
          <div key={section.title} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex h-11 items-center gap-3 rounded-xl px-2.5 text-[14px] transition-all duration-200 ${
                      active
                        ? "bg-indigo-500/[0.14] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-inset ring-indigo-400/25"
                        : "font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                    }`}
                  >
                    {/* Active indicator */}
                    <span
                      className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400 transition-all duration-200 ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    {/* Icon box */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                        active
                          ? "bg-indigo-500/25 text-indigo-200 ring-1 ring-inset ring-indigo-400/30"
                          : "bg-white/[0.04] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-slate-200"
                      }`}
                    >
                      <Icon size={17} strokeWidth={active ? 2.2 : 1.9} />
                    </span>

                    <span className="flex-1 truncate">{item.label}</span>

                    {item.badge && (
                      <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-indigo-300">
                        {item.badge}
                      </span>
                    )}

                    <ChevronRight
                      size={15}
                      className={`shrink-0 transition-all duration-200 ${
                        active
                          ? "translate-x-0 text-indigo-300 opacity-100"
                          : "-translate-x-1 text-slate-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* View Store */}
      <div className="relative shrink-0 border-t border-white/[0.06] p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-3 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/10 transition-all duration-200 hover:bg-indigo-500 hover:text-white hover:ring-indigo-400"
        >
          <ExternalLink size={16} strokeWidth={2} />
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-white/5 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-sm"
          />

          <aside className="relative h-full w-[280px] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin menu"
              className="absolute right-3 top-[22px] z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={18} strokeWidth={2} />
            </button>

            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile Trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40 transition-transform hover:scale-105 lg:hidden"
      >
        <Menu size={20} strokeWidth={2} />
      </button>
    </>
  );
}