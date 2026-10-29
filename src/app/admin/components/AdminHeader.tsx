"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BellOff,
  ChevronDown,
  ChevronRight,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

export type HeaderUser = {
  name: string;
  email?: string;
  role?: string;
};

export type HeaderNotification = {
  id: string | number;
  title: string;
  time?: string;
  unread?: boolean;
};

type AdminHeaderProps = {
  user?: HeaderUser | null;
  notifications?: HeaderNotification[];
  profileHref?: string;
  onSearch?: (value: string) => void;
  onNotificationClick?: (notification: HeaderNotification) => void;
  onViewAllNotifications?: () => void;
  onLogout?: () => void;
};

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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({
  user,
  size,
}: {
  user?: HeaderUser | null;
  size: "sm" | "md";
}) {
  const initials = user ? getInitials(user.name) : "";
  const dimension = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-[#4338ca] bg-[#4f46e5] font-semibold text-white shadow-sm shadow-indigo-600/30 ${dimension}`}
    >
      {initials || <User size={size === "sm" ? 16 : 18} strokeWidth={2} />}
    </div>
  );
}

export default function AdminHeader({
  user = null,
  notifications = [],
  profileHref,
  onSearch,
  onNotificationClick,
  onViewAllNotifications,
  onLogout,
}: AdminHeaderProps) {
  const pathname = usePathname() ?? "";
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const firstName = user?.name.trim().split(/\s+/)[0];

const router = useRouter();

const breadcrumbItems = pathname
  .split("/")
  .filter(Boolean)
  .map((segment, index, segments) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      pageTitles[href] ??
      segment.charAt(0).toUpperCase() + segment.slice(1);

    return { href, label };
  });


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

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(query.trim());
  };

  const menuItemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium !text-slate-700 transition-colors hover:!bg-indigo-50 hover:!text-indigo-700";

  return (
    <header className="sticky top-0 z-30 h-[76px] border-b border-slate-200 bg-white font-sans antialiased">
      {/* Sidebar se connect karne wali accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#252268] via-[#4338ca] to-[#4f46e5]" />

      <div className="flex h-full items-center justify-between gap-4 px-4 pt-[3px] sm:px-6 lg:px-8">
     
{/* Left: Back button, breadcrumbs and page title */}
<div className="flex min-w-0 items-center gap-3">
  <button
    type="button"
    onClick={() => router.back()}
    aria-label="Go back to previous page"
    title="Go back"
   className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#4f46e5]/20 bg-white text-[#4f46e5] transition-colors hover:border-[#4f46e5] hover:bg-[#4f46e5] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20"
  >
    <ArrowLeft size={18} strokeWidth={2} />
  </button>

  <div className="min-w-0">
  {pathname !== "/admin" && (
  <nav
    aria-label="Breadcrumb"
    className="mb-1 flex min-w-0 items-center gap-1 text-xs"
  >
    {breadcrumbItems.map((item, index) => (
      <span
        key={item.href}
        className="flex min-w-0 items-center gap-1"
      >
        {index > 0 && (
          <ChevronRight
            size={13}
            className="shrink-0 text-slate-400"
          />
        )}

        {index === breadcrumbItems.length - 1 ? (
          <span className="truncate font-semibold text-indigo-600">
            {item.label}
          </span>
        ) : (
          <Link
            href={item.href}
            className="truncate font-medium text-slate-500 hover:text-indigo-600"
          >
            {item.label}
          </Link>
        )}
      </span>
    ))}
  </nav>
)}

    <h1 className="truncate text-[18px] font-semibold tracking-tight text-indigo-600">
      {getPageTitle(pathname)}
    </h1>

    {firstName && (
      <p className="mt-0.5 hidden text-xs font-medium text-slate-500 sm:block">
        Welcome back, {firstName}
      </p>
    )}
  </div>
</div>


        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="relative hidden md:block"
          >
            <Search
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              aria-label="Search"
              className="h-10 w-64 rounded-xl !border !border-slate-200 !bg-slate-50 pl-9 pr-3 text-sm !text-slate-900 !outline-none transition-colors duration-150 placeholder:text-slate-400 hover:!border-slate-300 focus:!border-indigo-500 focus:!bg-white focus:ring-4 focus:ring-indigo-500/15 lg:w-72"
            />
          </form>

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
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl !border transition-colors duration-150 ${
                notifOpen
                  ? "!border-[#4338ca] !bg-[#4f46e5] !text-white shadow-md shadow-indigo-600/30"
                  : "!border-slate-200 !bg-white !text-slate-600 hover:!border-indigo-200 hover:!bg-indigo-50 hover:!text-indigo-600"
              }`}
            >
              <Bell size={19} strokeWidth={1.9} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#ef4444] px-1 text-[10px] font-bold leading-none text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[54px] z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-[0_16px_44px_rgba(15,23,42,0.16)] ring-1 ring-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-100">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200">
                      <BellOff size={20} strokeWidth={1.8} />
                    </span>
                    <p className="text-sm font-medium text-slate-600">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onNotificationClick?.(n);
                              setNotifOpen(false);
                            }}
                            className="flex w-full items-start gap-3 !bg-transparent px-4 py-3 text-left transition-colors hover:!bg-slate-50"
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
                              {n.time && (
                                <span className="mt-0.5 block text-xs text-slate-400">
                                  {n.time}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {onViewAllNotifications && (
                      <div className="border-t border-slate-100 p-2">
                        <button
                          type="button"
                          onClick={() => {
                            onViewAllNotifications();
                            setNotifOpen(false);
                          }}
                          className="w-full rounded-lg !bg-transparent px-3 py-2 text-center text-sm font-semibold !text-indigo-600 transition-colors hover:!bg-indigo-50"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className={`flex items-center gap-2.5 rounded-xl !border px-2 py-1.5 transition-colors duration-150 ${
                profileOpen
                  ? "!border-slate-200 !bg-slate-50"
                  : "!border-transparent !bg-transparent hover:!border-slate-200 hover:!bg-slate-50"
              }`}
            >
              <Avatar user={user} size="sm" />

              {user && (
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-5 text-slate-900">
                    {user.name}
                  </p>
                  {user.role && (
                    <p className="text-xs font-medium leading-4 text-slate-500">
                      {user.role}
                    </p>
                  )}
                </div>
              )}

              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`hidden text-slate-400 transition-transform duration-200 sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[54px] z-50 w-60 overflow-hidden rounded-2xl bg-white shadow-[0_16px_44px_rgba(15,23,42,0.16)] ring-1 ring-slate-200">
                {user && (
                  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                    <Avatar user={user} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>
                      {user.email && (
                        <p className="truncate text-xs font-medium text-slate-500">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-2">
                  {profileHref && (
                    <Link
                      href={profileHref}
                      onClick={() => setProfileOpen(false)}
                      className={menuItemClass}
                    >
                      <User
                        size={16}
                        strokeWidth={1.9}
                        className="text-slate-400"
                      />
                      My Profile
                    </Link>
                  )}

                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className={menuItemClass}
                  >
                    <Settings
                      size={16}
                      strokeWidth={1.9}
                      className="text-slate-400"
                    />
                    Profile
                  </Link>
                </div>

                {onLogout && (
                  <div className="border-t border-slate-100 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg !bg-transparent px-3 py-2.5 text-left text-sm font-medium !text-red-600 transition-colors hover:!bg-red-50"
                    >
                      <LogOut size={16} strokeWidth={1.9} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}