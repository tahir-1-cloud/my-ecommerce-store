"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Breadcrumb from "../Common/Breadcrumb";
import AddressModal from "./AddressModal";

import { ApiError } from "@/lib/apierror";
import { notify } from "@/lib/notify";
import { authService, clearAuthSession } from "@/services/authService";
import { customerService } from "@/services/customerService";

import type {
  AddressType,
  CustomerDashboard,
  CustomerProfile,
  CustomerAddress,
  CustomerAddressRequest,
  CustomerOrder,
  CustomerOrderDetails,
  CustomerOrderTracking,
} from "@/types/customer";

type AccountTab = "dashboard" | "orders" | "addresses" | "account-details";

const PAGE_SIZE = 10;

/* ---------- Helpers ---------- */

const formatAmount = (amount: number) =>
  `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0))}`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const humanize = (value: string) =>
  String(value ?? "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");

const norm = (value: string) =>
  String(value ?? "").replace(/[\s_]/g, "").toLowerCase();

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/* ---------- Shared UI ---------- */

const ICONS = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  orders:
    "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  address:
    "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
  box: "M21 16V8l-9-5-9 5v8l9 5zM3.3 7L12 12l8.7-5M12 22V12",
  check: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  wallet: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  truck:
    "M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  card: "M1 4h22v16H1zM1 10h22",
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
  close: "M18 6L6 18M6 6l12 12",
  alert: "M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
} as const;

type IconName = keyof typeof ICONS;

const Icon = ({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={ICONS[name]} />
  </svg>
);

const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue px-6 text-sm font-semibold text-white duration-200 ease-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60";

const btnOutline =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#CBD2E0] bg-white px-5 text-sm font-semibold text-dark duration-200 ease-out hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-60";

const btnSm = "!h-9 !px-3.5";

const inputClass =
  "h-12 w-full rounded-lg border border-[#CBD2E0] bg-white px-4 text-base text-dark outline-none duration-200 placeholder:text-[#8A94A6] hover:border-[#9AA5BC] focus:border-blue focus:ring-4 focus:ring-[#DDE3FB]";

const tones = {
  green: "bg-[#DCFCE7] text-[#166534]",
  amber: "bg-[#FEF3C7] text-[#92400E]",
  red: "bg-[#FEE2E2] text-[#991B1B]",
  blue: "bg-[#E0E7FF] text-[#3730A3]",
};

function StatusBadge({ status }: { status: string }) {
  const n = norm(status);

  const tone = ["delivered", "paid"].includes(n)
    ? tones.green
    : ["pending", "confirmed"].includes(n)
      ? tones.amber
      : ["cancelled", "failed", "refunded", "returned"].includes(n)
        ? tones.red
        : tones.blue;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {humanize(status) || "—"}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-gray-3 border-t-blue" />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: IconName;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-[#CBD2E0] bg-[#F8F9FC] px-6 py-12 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E0E7FF] text-blue">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="mb-1 text-lg font-semibold text-dark">{title}</h3>
      <p className="mb-5 max-w-sm text-sm text-[#4B5563]">{text}</p>
      {action}
    </div>
  );
}

function Overlay({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-end justify-center bg-dark/60 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-3 sm:rounded-2xl ${
          wide ? "max-w-[860px]" : "max-w-[620px]"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-3 bg-[#F8F9FC] px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-dark sm:text-xl">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-sm text-[#4B5563]">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-3 bg-white text-dark duration-200 hover:bg-dark hover:text-white"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-7">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-gray-3 bg-[#F8F9FC] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function AddressText({
  address,
}: {
  address: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state?: string | null;
    postalCode?: string | null;
    country: string;
  };
}) {
  const line = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    [address.state, address.postalCode].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-1">
      <p className="font-semibold text-dark">{address.fullName}</p>
      <p className="text-sm text-[#374151]">{address.phoneNumber}</p>
      <p className="text-sm leading-6 text-[#4B5563]">{line}</p>
    </div>
  );
}

/* ---------- Page ---------- */

function MyAccount() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AccountTab>("dashboard");

  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderPage, setOrderPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

  const [selectedOrder, setSelectedOrder] =
    useState<CustomerOrderDetails | null>(null);

  const [tracking, setTracking] = useState<CustomerOrderTracking | null>(null);

  const [editingAddress, setEditingAddress] =
    useState<CustomerAddress | null>(null);

  const [addressToDelete, setAddressToDelete] =
    useState<CustomerAddress | null>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [isAddressDeleting, setIsAddressDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isOrderDetailsLoading, setIsOrderDetailsLoading] = useState(false);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const handleApiError = useCallback(
    (apiError: unknown) => {
      if (apiError instanceof ApiError && apiError.status === 401) {
        clearAuthSession();
        router.replace("/signin");
        return true;
      }

      return false;
    },
    [router]
  );

  const loadInitialData = useCallback(async () => {
    const token =
      localStorage.getItem("accessToken") ?? localStorage.getItem("token");

    if (!token) {
      router.replace("/signin");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [dashboardResult, profileResult] = await Promise.all([
        customerService.getDashboard(),
        customerService.getProfile(),
      ]);

      setDashboard(dashboardResult);
      setProfile(profileResult);

      setProfileForm({
        firstName: profileResult.firstName,
        lastName: profileResult.lastName,
        email: profileResult.email,
        phoneNumber: profileResult.phoneNumber ?? "",
      });
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        setError(
          getErrorMessage(apiError, "Unable to load your account information.")
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError, router]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const loadOrders = useCallback(
    async (page: number) => {
      setIsOrdersLoading(true);
      setError("");

      try {
        const result = await customerService.getOrders(page, PAGE_SIZE);

        setOrders(result.orders);
        setOrderPage(result.page);
        setTotalPages(Math.max(result.totalPages, 1));
      } catch (apiError) {
        if (!handleApiError(apiError)) {
          setError(getErrorMessage(apiError, "Unable to load orders."));
        }
      } finally {
        setIsOrdersLoading(false);
      }
    },
    [handleApiError]
  );

  const loadAddresses = useCallback(async () => {
    setIsAddressesLoading(true);
    setError("");

    try {
      const result = await customerService.getAddresses();
      setAddresses(result);
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        setError(getErrorMessage(apiError, "Unable to load addresses."));
      }
    } finally {
      setIsAddressesLoading(false);
    }
  }, [handleApiError]);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    setError("");

    setSelectedOrder(null);
    setTracking(null);

    if (tab === "orders") {
      void loadOrders(1);
    }

    if (tab === "addresses") {
      void loadAddresses();
    }

    if (tab === "account-details" && !profile) {
      void loadInitialData();
    }
  };

  const handleProfileUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsProfileSaving(true);

    try {
      const updated = await customerService.updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        phoneNumber: profileForm.phoneNumber.trim() || null,
      });

      setProfile(updated);

      setProfileForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phoneNumber: updated.phoneNumber ?? "",
      });

      // Keep locally stored user information in sync.
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsed,
              firstName: updated.firstName,
              lastName: updated.lastName,
              email: updated.email,
            })
          );
        } catch {
          // Profile API remains the source of truth.
        }
      }

      notify.success("Profile updated successfully.");
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        notify.error(getErrorMessage(apiError, "Unable to update profile."));
      }
    } finally {
      setIsProfileSaving(false);
    }
  };

  // Jis type ka address nahi hai, sirf wahi add ho sakta hai
  const missingTypes = useMemo<AddressType[]>(() => {
    const result: AddressType[] = [];

    if (!addresses.some((a) => norm(a.type) === "shipping")) {
      result.push("Shipping" as AddressType);
    }
    if (!addresses.some((a) => norm(a.type) === "billing")) {
      result.push("Billing" as AddressType);
    }

    return result;
  }, [addresses]);

  const shippingAddress =
    addresses.find((a) => norm(a.type) === "shipping") ?? null;

  const openAddAddress = () => {
    if (missingTypes.length === 0) return;

    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleAddressSave = async (data: CustomerAddressRequest[]) => {
    setIsAddressSaving(true);

    try {
      if (editingAddress) {
        await customerService.updateAddress(editingAddress.id, data[0]);
        notify.success("Address updated successfully.");
      } else {
        for (const item of data) {
          await customerService.createAddress(item);
        }

        notify.success(
          data.length > 1
            ? "Shipping and billing addresses added."
            : "Address added successfully."
        );
      }

      setIsAddressModalOpen(false);
      setEditingAddress(null);

      await loadAddresses();
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        notify.error(getErrorMessage(apiError, "Unable to save address."));
      }
    } finally {
      setIsAddressSaving(false);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsAddressDeleting(true);

    try {
      await customerService.deleteAddress(addressToDelete.id);

      notify.success("Address deleted successfully.");
      setAddressToDelete(null);
      await loadAddresses();
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        notify.error(getErrorMessage(apiError, "Unable to delete address."));
      }
    } finally {
      setIsAddressDeleting(false);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await customerService.setDefaultAddress(id);

      notify.success("Default address updated.");
      await loadAddresses();
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        notify.error(
          getErrorMessage(apiError, "Unable to update default address.")
        );
      }
    }
  };

  const handleViewOrder = async (id: number) => {
    setSelectedOrder(null);
    setTracking(null);
    setIsOrderDetailsLoading(true);

    try {
      const result = await customerService.getOrderDetails(id);
      setSelectedOrder(result);
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        notify.error(
          getErrorMessage(apiError, "Unable to load order details.")
        );
      }
    } finally {
      setIsOrderDetailsLoading(false);
    }
  };

  const handleTrackOrder = async (id: number) => {
    setTracking(null);
    setSelectedOrder(null);
    setIsTrackingLoading(true);

    try {
      const result = await customerService.getOrderTracking(id);
      setTracking(result);
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        notify.error(
          getErrorMessage(apiError, "Unable to load order tracking.")
        );
      }
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await authService.logout();
    } catch (logoutError) {
      notify.error(
        getErrorMessage(
          logoutError,
          "Unable to notify the server that you signed out."
        )
      );
    } finally {
      clearAuthSession();
      router.replace("/signin");
      router.refresh();
    }
  };

  const customerName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : dashboard?.customerName ?? "";

  const displayName =
    customerName || profile?.email || (isLoading ? "My Account" : "Customer");

  const tabs: { id: AccountTab; label: string; icon: IconName }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "orders", label: "Orders", icon: "orders" },
    { id: "addresses", label: "Addresses", icon: "address" },
    { id: "account-details", label: "Account details", icon: "user" },
  ];

  return (
    <>
      <Breadcrumb title="My Account" pages={["my account"]} />

      <section className="bg-gray-2 pb-14 pt-8 antialiased sm:pb-20 sm:pt-12">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          {/* Profile banner */}
          <div className="mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-blue to-blue-dark shadow-1 sm:mb-7.5">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-blue sm:h-20 sm:w-20 sm:text-3xl">
                  {getInitials(customerName || profile?.email || "U")}
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#DDE3FB]">
                    Welcome back
                  </p>
                  <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
                    {displayName}
                  </h1>
                  {profile?.email && (
                    <p className="break-all text-sm text-[#DDE3FB]">
                      {profile.email}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex h-11 w-fit items-center rounded-lg bg-white px-5 text-sm font-semibold text-blue duration-200 ease-out hover:bg-dark hover:text-white"
              >
                Continue shopping
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px_1fr] sm:gap-7.5">
            {/* Navigation */}
            <aside className="h-fit rounded-xl bg-white p-3 shadow-1 lg:sticky lg:top-32 lg:p-4">
              <nav aria-label="Customer account">
                <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {tabs.map((tab) => {
                    const active = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        aria-current={active ? "page" : undefined}
                        className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-left text-[15px] font-semibold duration-200 ${
                          active
                            ? "bg-blue text-white"
                            : "bg-[#F3F4F8] text-dark hover:bg-[#E0E7FF] hover:text-blue"
                        }`}
                      >
                        <Icon name={tab.icon} size={18} />
                        {tab.label}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg bg-[#F3F4F8] px-4 py-3 text-left text-[15px] font-semibold text-dark duration-200 hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60 lg:mt-2"
                  >
                    <Icon name="logout" size={18} />
                    {isLoggingOut ? "Signing out..." : "Logout"}
                  </button>
                </div>
              </nav>
            </aside>

            {/* Content */}
            <main className="min-w-0 rounded-xl bg-white p-4 shadow-1 sm:p-8">
              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-2.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#991B1B]"
                >
                  <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {activeTab === "dashboard" &&
                (isLoading ? (
                  <Spinner />
                ) : dashboard ? (
                  <DashboardSection
                    dashboard={dashboard}
                    customerName={customerName}
                    onGoTo={handleTabChange}
                  />
                ) : null)}

              {activeTab === "orders" && (
                <OrdersSection
                  orders={orders}
                  page={orderPage}
                  totalPages={totalPages}
                  isLoading={isOrdersLoading}
                  onPageChange={loadOrders}
                  onViewOrder={handleViewOrder}
                  onTrackOrder={handleTrackOrder}
                  selectedOrder={selectedOrder}
                  tracking={tracking}
                  isOrderDetailsLoading={isOrderDetailsLoading}
                  isTrackingLoading={isTrackingLoading}
                  onCloseDetails={() => setSelectedOrder(null)}
                  onCloseTracking={() => setTracking(null)}
                />
              )}

              {activeTab === "addresses" && (
                <AddressesSection
                  addresses={addresses}
                  missingTypes={missingTypes}
                  isLoading={isAddressesLoading}
                  onAdd={openAddAddress}
                  onEdit={openEditAddress}
                  onDelete={setAddressToDelete}
                  onSetDefault={handleSetDefaultAddress}
                />
              )}

              {activeTab === "account-details" && (
                <ProfileSection
                  form={profileForm}
                  onChange={setProfileForm}
                  onSubmit={handleProfileUpdate}
                  isSaving={isProfileSaving}
                />
              )}
            </main>
          </div>
        </div>
      </section>

      <AddressModal
        isOpen={isAddressModalOpen}
        closeModal={() => {
          if (!isAddressSaving) {
            setIsAddressModalOpen(false);
            setEditingAddress(null);
          }
        }}
        address={editingAddress}
        onSave={handleAddressSave}
        isSaving={isAddressSaving}
        missingTypes={missingTypes}
        shippingAddress={shippingAddress}
      />

      {addressToDelete && (
        <Overlay
          title="Delete address?"
          subtitle={`${addressToDelete.type} address`}
          onClose={() => {
            if (!isAddressDeleting) setAddressToDelete(null);
          }}
          footer={
            <>
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={isAddressDeleting}
                className={btnOutline}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAddress}
                disabled={isAddressDeleting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red px-6 text-sm font-semibold text-white duration-200 hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAddressDeleting ? "Deleting..." : "Delete address"}
              </button>
            </>
          }
        >
          <div className="rounded-lg border border-gray-3 bg-[#F8F9FC] p-4">
            <AddressText address={addressToDelete} />
          </div>
          <p className="mt-4 text-sm text-[#4B5563]">
            This action cannot be undone. You can add the address again later.
          </p>
        </Overlay>
      )}
    </>
  );
}

/* ---------- Dashboard ---------- */

function DashboardSection({
  dashboard,
  customerName,
  onGoTo,
}: {
  dashboard: CustomerDashboard;
  customerName: string;
  onGoTo: (tab: AccountTab) => void;
}) {
  const stats: { label: string; value: number; icon: IconName; tone: string }[] =
    [
      {
        label: "Total orders",
        value: dashboard.totalOrders,
        icon: "orders",
        tone: tones.blue,
      },
      {
        label: "Pending",
        value: dashboard.pendingOrders,
        icon: "clock",
        tone: tones.amber,
      },
      {
        label: "Processing",
        value: dashboard.processingOrders,
        icon: "box",
        tone: tones.blue,
      },
      {
        label: "Delivered",
        value: dashboard.deliveredOrders,
        icon: "check",
        tone: tones.green,
      },
    ];

  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold text-dark sm:text-2xl">
        Hello{customerName ? `, ${customerName}` : ""}
      </h2>
      <p className="mb-6 text-[#4B5563]">
        Here is a quick summary of your account and recent orders.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-3 bg-white p-4"
          >
            <span
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.tone}`}
            >
              <Icon name={stat.icon} size={20} />
            </span>
            <p className="text-sm text-[#4B5563]">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-dark">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 flex items-center gap-4 rounded-xl bg-blue p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-blue">
          <Icon name="wallet" size={22} />
        </span>
        <div>
          <p className="text-sm font-medium text-[#DDE3FB]">Total spent</p>
          <p className="text-2xl font-bold text-white sm:text-3xl">
            {formatAmount(dashboard.totalSpent)}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-dark">Recent orders</h3>

        <button
          type="button"
          onClick={() => onGoTo("orders")}
          className="text-sm font-semibold text-blue hover:underline"
        >
          View all orders
        </button>
      </div>

      {dashboard.recentOrders.length === 0 ? (
        <EmptyState
          icon="orders"
          title="No orders yet"
          text="When you place an order, it will show up here."
          action={
            <Link href="/shop-with-sidebar" className={btnPrimary}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <OrdersList orders={dashboard.recentOrders} />
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onGoTo("addresses")}
          className="flex items-center gap-3 rounded-xl border border-gray-3 p-4 text-left duration-200 hover:border-blue hover:bg-[#F3F6FF]"
        >
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones.blue}`}>
            <Icon name="address" size={20} />
          </span>
          <span>
            <span className="block font-semibold text-dark">My addresses</span>
            <span className="block text-sm text-[#4B5563]">
              Manage shipping and billing
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onGoTo("account-details")}
          className="flex items-center gap-3 rounded-xl border border-gray-3 p-4 text-left duration-200 hover:border-blue hover:bg-[#F3F6FF]"
        >
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones.blue}`}>
            <Icon name="user" size={20} />
          </span>
          <span>
            <span className="block font-semibold text-dark">
              Account details
            </span>
            <span className="block text-sm text-[#4B5563]">
              Update your profile
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}

/* ---------- Orders ---------- */

function OrdersList({
  orders,
  onViewOrder,
  onTrackOrder,
}: {
  orders: Pick<
    CustomerOrder,
    "id" | "orderNumber" | "createdAt" | "status" | "itemsCount" | "totalAmount"
  >[];
  onViewOrder?: (id: number) => void;
  onTrackOrder?: (id: number) => void;
}) {
  const hasActions = !!onViewOrder || !!onTrackOrder;

  return (
    <>
      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {orders.map((order) => (
          <li
            key={order.id}
            className="rounded-xl border border-gray-3 bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-blue">
                  {order.orderNumber}
                </p>
                <p className="text-sm text-[#4B5563]">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[#4B5563]">
                {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
              </span>
              <span className="text-lg font-bold text-dark">
                {formatAmount(order.totalAmount)}
              </span>
            </div>

            {hasActions && (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {onViewOrder && (
                  <button
                    type="button"
                    onClick={() => onViewOrder(order.id)}
                    className={`${btnOutline} ${btnSm}`}
                  >
                    Details
                  </button>
                )}
                {onTrackOrder && (
                  <button
                    type="button"
                    onClick={() => onTrackOrder(order.id)}
                    className={`${btnPrimary} ${btnSm}`}
                  >
                    Track
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-3 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F8F9FC] text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
              <th className="px-4 py-3.5">Order</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Items</th>
              <th className="px-4 py-3.5 text-right">Total</th>
              {hasActions && <th className="px-4 py-3.5 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-3">
            {orders.map((order) => (
              <tr key={order.id} className="duration-150 hover:bg-[#F8F9FC]">
                <td className="px-4 py-4 font-semibold text-blue">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-4 text-[#374151]">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-4 text-[#374151]">
                  {order.itemsCount}
                </td>
                <td className="px-4 py-4 text-right font-semibold text-dark">
                  {formatAmount(order.totalAmount)}
                </td>
                {hasActions && (
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {onViewOrder && (
                        <button
                          type="button"
                          onClick={() => onViewOrder(order.id)}
                          className={`${btnOutline} ${btnSm}`}
                        >
                          <Icon name="eye" size={15} />
                          Details
                        </button>
                      )}
                      {onTrackOrder && (
                        <button
                          type="button"
                          onClick={() => onTrackOrder(order.id)}
                          className={`${btnPrimary} ${btnSm}`}
                        >
                          <Icon name="truck" size={15} />
                          Track
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OrdersSection({
  orders,
  page,
  totalPages,
  isLoading,
  onPageChange,
  onViewOrder,
  onTrackOrder,
  selectedOrder,
  tracking,
  isOrderDetailsLoading,
  isTrackingLoading,
  onCloseDetails,
  onCloseTracking,
}: {
  orders: CustomerOrder[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewOrder: (id: number) => void;
  onTrackOrder: (id: number) => void;
  selectedOrder: CustomerOrderDetails | null;
  tracking: CustomerOrderTracking | null;
  isOrderDetailsLoading: boolean;
  isTrackingLoading: boolean;
  onCloseDetails: () => void;
  onCloseTracking: () => void;
}) {
  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold text-dark sm:text-2xl">
        My Orders
      </h2>
      <p className="mb-6 text-[#4B5563]">
        View your order details and track their delivery.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-2" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="orders"
          title="No orders yet"
          text="You haven't placed any orders. Start shopping to see them here."
          action={
            <Link href="/shop-with-sidebar" className={btnPrimary}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <>
          <OrdersList
            orders={orders}
            onViewOrder={onViewOrder}
            onTrackOrder={onTrackOrder}
          />

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => onPageChange(page - 1)}
                className={`${btnOutline} ${btnSm}`}
              >
                Previous
              </button>

              <span className="text-sm font-medium text-[#374151]">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || isLoading}
                onClick={() => onPageChange(page + 1)}
                className={`${btnOutline} ${btnSm}`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {(isOrderDetailsLoading || selectedOrder) && (
        <OrderDetailsModal
          order={selectedOrder}
          loading={isOrderDetailsLoading}
          onClose={onCloseDetails}
          onTrack={onTrackOrder}
        />
      )}

      {(isTrackingLoading || tracking) && (
        <OrderTrackingModal
          tracking={tracking}
          loading={isTrackingLoading}
          onClose={onCloseTracking}
        />
      )}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: number;
  green?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        green ? "text-[#166534]" : "text-[#374151]"
      }`}
    >
      <span>{label}</span>
      <span className="font-medium">
        {green ? "-" : ""}
        {formatAmount(value)}
      </span>
    </div>
  );
}

function OrderDetailsModal({
  order,
  loading,
  onClose,
  onTrack,
}: {
  order: CustomerOrderDetails | null;
  loading: boolean;
  onClose: () => void;
  onTrack: (id: number) => void;
}) {
  const shipping = order?.addresses.find((a) => norm(a.type) === "shipping");
  const billing = order?.addresses.find((a) => norm(a.type) === "billing");

  return (
    <Overlay
      title="Order details"
      subtitle={order?.orderNumber}
      onClose={onClose}
      wide
      footer={
        order && (
          <>
            <button type="button" onClick={onClose} className={btnOutline}>
              Close
            </button>
            <button
              type="button"
              onClick={() => onTrack(order.id)}
              className={btnPrimary}
            >
              <Icon name="truck" size={17} />
              Track order
            </button>
          </>
        )
      }
    >
      {loading || !order ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
            <span className="text-sm text-[#4B5563]">
              Placed on {formatDate(order.createdAt)}
            </span>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-dark">
              Items ({order.items.length})
            </h3>

            <ul className="divide-y divide-gray-3 rounded-xl border border-gray-3">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3.5 p-3.5 sm:p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E0E7FF] text-blue">
                    <Icon name="box" size={20} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold text-dark">
                      {item.productName}
                    </p>
                    <p className="text-sm text-[#4B5563]">
                      SKU: {item.sku} · {formatAmount(item.unitPrice)} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-dark">
                    {formatAmount(item.totalPrice)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="ml-auto max-w-sm space-y-2.5 text-sm">
            <SummaryRow label="Subtotal" value={order.subtotal} />
            <SummaryRow label="Shipping" value={order.shippingAmount} />
            {order.discountAmount > 0 && (
              <SummaryRow label="Discount" value={order.discountAmount} green />
            )}
            {order.taxAmount > 0 && (
              <SummaryRow label="Tax" value={order.taxAmount} />
            )}
            <div className="flex items-center justify-between rounded-lg bg-[#E0E7FF] px-4 py-3.5">
              <span className="font-semibold text-dark">Total</span>
              <span className="text-xl font-bold text-blue">
                {formatAmount(order.totalAmount)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-3 p-4">
              <p className="mb-3 flex items-center gap-2 font-semibold text-dark">
                <Icon name="truck" size={18} className="text-blue" />
                Shipping address
              </p>
              {shipping ? (
                <AddressText address={shipping} />
              ) : (
                <p className="text-sm text-[#4B5563]">Not provided.</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-3 p-4">
              <p className="mb-3 flex items-center gap-2 font-semibold text-dark">
                <Icon name="card" size={18} className="text-blue" />
                Billing address
              </p>
              {billing ? (
                <AddressText address={billing} />
              ) : (
                <p className="text-sm text-[#4B5563]">Not provided.</p>
              )}
            </div>
          </div>

          <p className="text-sm text-[#374151]">
            Payment method:{" "}
            <strong className="text-dark">{order.paymentMethod}</strong>
          </p>
        </div>
      )}
    </Overlay>
  );
}

const trackingSteps = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "OutForDelivery",
  "Delivered",
];

function OrderTrackingModal({
  tracking,
  loading,
  onClose,
}: {
  tracking: CustomerOrderTracking | null;
  loading: boolean;
  onClose: () => void;
}) {
  const currentIndex = tracking
    ? trackingSteps.findIndex((s) => norm(s) === norm(tracking.currentStatus))
    : -1;

  const negative = tracking
    ? ["cancelled", "returned"].includes(norm(tracking.currentStatus))
    : false;

  const history = tracking
    ? [...tracking.history].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  return (
    <Overlay
      title="Order tracking"
      subtitle={tracking?.orderNumber}
      onClose={onClose}
      wide
      footer={
        <button type="button" onClick={onClose} className={btnOutline}>
          Close
        </button>
      }
    >
      {loading || !tracking ? (
        <Spinner />
      ) : (
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-sm text-[#4B5563]">Current status</span>
            <StatusBadge status={tracking.currentStatus} />
          </div>

          {negative ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#991B1B]">
              <Icon name="alert" size={18} />
              This order is {humanize(tracking.currentStatus).toLowerCase()}.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-3 bg-[#F8F9FC] p-4 sm:p-5">
              <ol className="flex min-w-[560px] items-start">
                {trackingSteps.map((step, index) => {
                  const done = currentIndex >= 0 && index <= currentIndex;
                  const last = index === trackingSteps.length - 1;

                  return (
                    <li
                      key={step}
                      className={`relative flex flex-col items-center text-center ${
                        last ? "flex-none" : "flex-1"
                      }`}
                    >
                      {!last && (
                        <span
                          className={`absolute left-1/2 top-4 h-1 w-full ${
                            currentIndex >= 0 && index < currentIndex
                              ? "bg-blue"
                              : "bg-[#CBD2E0]"
                          }`}
                        />
                      )}

                      <span
                        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          done
                            ? "bg-blue text-white"
                            : "border-2 border-[#CBD2E0] bg-white text-[#6B7280]"
                        }`}
                      >
                        {done ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </span>

                      <span
                        className={`mt-2 w-20 text-xs font-semibold leading-tight ${
                          done ? "text-dark" : "text-[#6B7280]"
                        }`}
                      >
                        {humanize(step)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <div>
            <h3 className="mb-4 font-semibold text-dark">Tracking history</h3>

            {history.length === 0 ? (
              <p className="text-sm text-[#4B5563]">
                No tracking history is available yet.
              </p>
            ) : (
              <ol className="relative space-y-6 border-l-2 border-[#CBD2E0] pl-6">
                {history.map((item, index) => (
                  <li
                    key={`${item.status}-${item.createdAt}-${index}`}
                    className="relative"
                  >
                    <span
                      className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-white ${
                        index === 0 ? "bg-blue" : "bg-[#9AA5BC]"
                      }`}
                    />
                    <div className="flex flex-wrap items-center gap-2.5">
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-[#4B5563]">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    {item.note && (
                      <p className="mt-2 text-sm text-[#374151]">{item.note}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </Overlay>
  );
}

/* ---------- Addresses ---------- */

function AddressesSection({
  addresses,
  missingTypes,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  addresses: CustomerAddress[];
  missingTypes: AddressType[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (address: CustomerAddress) => void;
  onDelete: (address: CustomerAddress) => void;
  onSetDefault: (id: number) => void;
}) {
  const byType = (type: string) =>
    addresses
      .filter((a) => norm(a.type) === type)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  const columns: { key: "shipping" | "billing"; title: string; icon: IconName }[] =
    [
      { key: "shipping", title: "Shipping address", icon: "truck" },
      { key: "billing", title: "Billing address", icon: "card" },
    ];

  const addLabel =
    missingTypes.length === 2
      ? "Add address"
      : `Add ${String(missingTypes[0] ?? "").toLowerCase()} address`;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 text-xl font-semibold text-dark sm:text-2xl">
            My Addresses
          </h2>
          <p className="text-[#4B5563]">
            Save your addresses once and use them every time you check out.
          </p>
        </div>

        {missingTypes.length > 0 && !isLoading && (
          <button type="button" onClick={onAdd} className={btnPrimary}>
            <Icon name="plus" size={18} />
            {addLabel}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-2" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {columns.map((column) => {
            const list = byType(column.key);

            return (
              <div key={column.key}>
                <h3 className="mb-3 flex items-center gap-2.5 font-semibold text-dark">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones.blue}`}
                  >
                    <Icon name={column.icon} size={18} />
                  </span>
                  {column.title}
                </h3>

                {list.length === 0 ? (
                  <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#CBD2E0] bg-[#F8F9FC] p-5">
                    <p className="text-sm text-[#4B5563]">
                      No {column.key} address saved yet.
                    </p>
                    <button
                      type="button"
                      onClick={onAdd}
                      className={`${btnOutline} ${btnSm}`}
                    >
                      <Icon name="plus" size={15} />
                      Add {column.key} address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {list.map((address) => (
                      <div
                        key={address.id}
                        className={`rounded-xl border-2 p-5 ${
                          address.isDefault
                            ? "border-blue bg-[#F3F6FF]"
                            : "border-gray-3 bg-white"
                        }`}
                      >
                        {list.length > 1 && address.isDefault && (
                          <span className="mb-3 inline-flex rounded-full bg-blue px-3 py-1 text-xs font-semibold text-white">
                            Default
                          </span>
                        )}

                        <AddressText address={address} />

                        <div className="mt-4 flex flex-wrap gap-2.5 border-t border-gray-3 pt-4">
                          <button
                            type="button"
                            onClick={() => onEdit(address)}
                            className={`${btnOutline} ${btnSm}`}
                          >
                            <Icon name="edit" size={15} />
                            Edit
                          </button>

                          {list.length > 1 && !address.isDefault && (
                            <button
                              type="button"
                              onClick={() => onSetDefault(address.id)}
                              className={`${btnOutline} ${btnSm}`}
                            >
                              Set default
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDelete(address)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#FCA5A5] bg-white px-3.5 text-sm font-semibold text-[#B91C1C] duration-200 hover:bg-red hover:text-white"
                          >
                            <Icon name="trash" size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------- Profile ---------- */

function ProfileSection({
  form,
  onChange,
  onSubmit,
  isSaving,
}: {
  form: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  onChange: React.Dispatch<
    React.SetStateAction<{
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    }>
  >;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}) {
  const labelClass = "mb-2 block text-sm font-semibold text-dark";
  const Req = () => <span className="ml-0.5 text-red">*</span>;

  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold text-dark sm:text-2xl">
        Account Details
      </h2>
      <p className="mb-6 text-[#4B5563]">
        Keep your personal information up to date.
      </p>

      <form onSubmit={onSubmit} className="max-w-[640px]">
        <div className="mb-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First Name <Req />
            </label>
            <input
              id="firstName"
              required
              maxLength={100}
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) =>
                onChange((previous) => ({
                  ...previous,
                  firstName: e.target.value,
                }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="lastName" className={labelClass}>
              Last Name <Req />
            </label>
            <input
              id="lastName"
              required
              maxLength={100}
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) =>
                onChange((previous) => ({
                  ...previous,
                  lastName: e.target.value,
                }))
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="email" className={labelClass}>
            Email Address <Req />
          </label>
          <input
            id="email"
            required
            type="email"
            maxLength={256}
            autoComplete="email"
            value={form.email}
            onChange={(e) =>
              onChange((previous) => ({
                ...previous,
                email: e.target.value,
              }))
            }
            className={inputClass}
          />
        </div>

        <div className="mb-7">
          <label htmlFor="phone" className={labelClass}>
            Phone Number{" "}
            <span className="font-normal text-[#6B7280]">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            maxLength={20}
            autoComplete="tel"
            value={form.phoneNumber}
            onChange={(e) =>
              onChange((previous) => ({
                ...previous,
                phoneNumber: e.target.value,
              }))
            }
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={isSaving} className={btnPrimary}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default MyAccount;