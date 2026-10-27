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
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#252268] via-[#1b1953] to-[#12103a] font-sans antialiased">
      {/* Depth layers (sirf background mein, text ke peeche) */}
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[#3a3790]" />

      {/* Brand */}
      <div className="relative z-10 flex h-[76px] shrink-0 items-center border-b border-[#34318a] px-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4338ca] bg-[#4f46e5] text-white shadow-[0_6px_14px_-3px_rgba(79,70,229,0.7),inset_0_1px_0_rgba(255,255,255,0.3)]">
            <Box size={20} strokeWidth={2} />
          </div>

          <div className="leading-none">
            <h1 className="text-[16px] font-semibold tracking-tight text-white">
              ShopAdmin
            </h1>
            <p className="mt-1.5 text-[11px] font-medium text-[#a5b4fc]">
              Ecommerce Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Admin navigation"
        className="relative z-10 flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => (
          <div key={section.title} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8f9cf0]">
              {section.title}
            </p>

            <div className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex h-11 items-center gap-3 rounded-xl border px-2.5 text-[14px] transition-colors duration-150 ${
                      active
                        ? "border-[#4338ca] bg-[#4f46e5] font-semibold text-white shadow-[0_8px_18px_-6px_rgba(79,70,229,0.75),inset_0_1px_0_rgba(255,255,255,0.25)]"
                        : "border-transparent font-medium text-[#e0e7ff] hover:border-[#4a47a8] hover:bg-[#312e81] hover:text-white hover:shadow-[0_6px_14px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
                    }`}
                  >
                    {/* Icon box */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
                        active
                          ? "bg-[#6366f1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                          : "bg-[#2e2b7a] text-[#c7d2fe] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] group-hover:bg-[#4338ca] group-hover:text-white"
                      }`}
                    >
                      <Icon size={17} strokeWidth={active ? 2.2 : 2} />
                    </span>

                    <span className="flex-1 truncate">{item.label}</span>

                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                          active
                            ? "bg-[#6366f1] text-white"
                            : "bg-[#3b37a0] text-[#e0e7ff]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    <ChevronRight
                      size={15}
                      className={`shrink-0 transition-opacity duration-150 ${
                        active
                          ? "text-white opacity-100"
                          : "text-[#c7d2fe] opacity-0 group-hover:opacity-100"
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
      <div className="relative z-10 shrink-0 border-t border-[#34318a] p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-[#4a47a8] bg-[#312e81] px-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors duration-150 hover:border-[#4338ca] hover:bg-[#4f46e5] hover:shadow-[0_8px_18px_-6px_rgba(79,70,229,0.75),inset_0_1px_0_rgba(255,255,255,0.25)]"
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
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 shadow-[6px_0_30px_-8px_rgba(30,27,75,0.45)] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-default bg-slate-950/60"
          />

          <aside className="relative h-full w-[280px] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin menu"
              className="absolute right-3 top-[22px] z-20 flex h-8 w-8 items-center justify-center rounded-lg text-[#c7d2fe] transition-colors hover:bg-[#312e81] hover:text-white"
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
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-[#4338ca] bg-[#4f46e5] text-white shadow-[0_8px_18px_-6px_rgba(79,70,229,0.75),inset_0_1px_0_rgba(255,255,255,0.25)] transition-colors hover:bg-[#4338ca] lg:hidden"
      >
        <Menu size={20} strokeWidth={2} />
      </button>
    </>
  );
}