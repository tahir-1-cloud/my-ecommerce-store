"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Notification = {
  id: number;
  title: string;
  time: string;
  unread: boolean;
};

const notifications: Notification[] = [
  { id: 1, title: "New order #1042 received", time: "2 min ago", unread: true },
  { id: 2, title: "Low stock: Wireless Earbuds", time: "1 hour ago", unread: true },
  { id: 3, title: "Payment confirmed for #1038", time: "3 hours ago", unread: false },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/customers": "Customers",
  "/admin/inventory": "Inventory",
  "/admin/payments": "Payments",
  "/admin/shipping": "Shipping",
  "/admin/reports": "Reports",
  "/admin/reviews": "Reviews",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];

  const match = Object.keys(pageTitles)
    .filter((key) => key !== "/admin" && pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];

  return match ? pageTitles[match] : "Dashboard";
}

export default function AdminHeader() {
  const pathname = usePathname() ?? "";
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns on outside click + Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 h-[76px] border-b border-slate-200/80 bg-white/90 font-sans backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Page title */}
        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-semibold tracking-tight text-slate-900">
            {getPageTitle(pathname)}
          </h1>
          <p className="mt-0.5 hidden text-xs font-medium text-slate-500 sm:block">
            Welcome back, John
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search orders, products..."
              className="h-10 w-64 rounded-xl border border-transparent bg-slate-100 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:w-80 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 lg:w-72 lg:focus:w-96"
            />
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 ${
                notifOpen
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Bell size={19} strokeWidth={1.9} />
              {unreadCount > 0 && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[52px] z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.14)] ring-1 ring-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            n.unread ? "bg-indigo-500" : "bg-transparent"
                          }`}
                        />
                        <span className="min-w-0">
                          <span
                            className={`block truncate text-sm ${
                              n.unread
                                ? "font-semibold text-slate-900"
                                : "font-medium text-slate-600"
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-400">
                            {n.time}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="w-full rounded-lg px-3 py-2 text-center text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-150 ${
                profileOpen ? "bg-slate-100" : "hover:bg-slate-100"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-sm">
                JD
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-5 text-slate-900">
                  John Doe
                </p>
                <p className="text-xs font-medium leading-4 text-slate-500">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`hidden text-slate-400 transition-transform duration-200 sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[52px] z-50 w-60 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.14)] ring-1 ring-slate-200">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                    JD
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      John Doe
                    </p>
                    <p className="truncate text-xs font-medium text-slate-500">
                      admin@example.com
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <User size={16} strokeWidth={1.9} className="text-slate-400" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Settings size={16} strokeWidth={1.9} className="text-slate-400" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} strokeWidth={1.9} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}