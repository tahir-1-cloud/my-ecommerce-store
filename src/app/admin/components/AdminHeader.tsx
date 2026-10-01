"use client";

import {
Bell,
ChevronDown,
Search,
} from "lucide-react";
import { useState } from "react";

export default function AdminHeader() {
const [profileOpen, setProfileOpen] = useState(false);

return ( <header className="sticky top-0 z-30 h-[74px] border-b border-slate-200/70 bg-white/95 backdrop-blur-xl"> <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
{/* Search */} <div className="relative hidden max-w-2xl flex-1 md:block"> <Search
         size={18}
         strokeWidth={2}
         className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
       />

      <input
        type="text"
        placeholder="Search products, orders, customers..."
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-200 hover:bg-blue-50/40 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
      />
    </div>

    {/* Mobile Search */}
    <button
      type="button"
      aria-label="Search"
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 md:hidden"
    >
      <Search size={19} strokeWidth={2} />
    </button>

    {/* Right Actions */}
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Notification */}
      <button
        type="button"
        aria-label="Notifications"
        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      >
        <Bell
          size={19}
          strokeWidth={1.9}
          className="transition-transform duration-200 group-hover:scale-105"
        />

        {/* Notification Dot */}
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      {/* Divider */}
      <div className="hidden h-8 w-px bg-slate-200 sm:block" />

      {/* Profile */}
      <div className="relative ml-0.5">
        <button
          type="button"
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2.5 rounded-xl p-1.5 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
        >
          {/* Avatar */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-xs font-bold text-white shadow-md shadow-blue-200">
            JD

            {/* Online Status */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          {/* User Info */}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-5 text-slate-900">
              John Doe
            </p>

            <p className="text-[11px] font-medium text-slate-400">
              Administrator
            </p>
          </div>

          <ChevronDown
            size={16}
            strokeWidth={2}
            className={`hidden text-slate-400 transition-transform duration-200 sm:block ${
              profileOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </button>

        {/* Profile Dropdown */}
        {profileOpen && (
          <div className="absolute right-0 top-[54px] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-sm font-bold shadow-sm backdrop-blur-sm">
                  JD
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    John Doe
                  </p>

                  <p className="truncate text-xs text-white/75">
                    admin@example.com
                  </p>
                </div>
              </div>

              {/* Admin Badge */}
              <div className="mt-3 inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                Administrator
              </div>
            </div>

            {/* Menu */}
            <div className="p-2">
              <button
                type="button"
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-blue-50 hover:text-blue-700"
              >
                My Profile
              </button>

              <button
                type="button"
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-purple-50 hover:text-purple-700"
              >
                Settings
              </button>

              <div className="my-1.5 h-px bg-slate-100" />

              <button
                type="button"
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Color Accent */}
  <div className="h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />
</header>


);
}
