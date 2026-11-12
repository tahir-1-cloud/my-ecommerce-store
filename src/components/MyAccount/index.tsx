
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Breadcrumb from "../Common/Breadcrumb";
import AddressModal from "./AddressModal";

import { ApiError } from "@/lib/apierror";
import { notify } from "@/lib/notify";
import { authService, clearAuthSession } from "@/services/authService";
import { customerService } from "@/services/customerService";

import type {
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

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString();

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

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

  const [tracking, setTracking] =
    useState<CustomerOrderTracking | null>(null);

  const [editingAddress, setEditingAddress] =
    useState<CustomerAddress | null>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
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
          getErrorMessage(
            apiError,
            "Unable to load your account information."
          )
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
        notify.error(
          getErrorMessage(apiError, "Unable to update profile.")
        );
      }
    } finally {
      setIsProfileSaving(false);
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleAddressSave = async (data: CustomerAddressRequest) => {
    setIsAddressSaving(true);

    try {
      if (editingAddress) {
        await customerService.updateAddress(editingAddress.id, data);
        notify.success("Address updated successfully.");
      } else {
        await customerService.createAddress(data);
        notify.success("Address added successfully.");
      }

      setIsAddressModalOpen(false);
      setEditingAddress(null);

      await loadAddresses();
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        notify.error(
          getErrorMessage(apiError, "Unable to save address.")
        );
      }
    } finally {
      setIsAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await customerService.deleteAddress(id);

      notify.success("Address deleted successfully.");
      await loadAddresses();
    } catch (apiError) {
      if (!handleApiError(apiError)) {
        notify.error(
          getErrorMessage(apiError, "Unable to delete address.")
        );
      }
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

  const tabs: { id: AccountTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "addresses", label: "Addresses" },
    { id: "account-details", label: "Account details" },
  ];

  return (
    <>
      <Breadcrumb title="My Account" pages={["my account"]} />

      <section className="bg-gray-2 py-12 sm:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="grid gap-7.5 xl:grid-cols-[270px_1fr]">
            <aside className="rounded-xl bg-white p-5 shadow-1 sm:p-7.5">
              <div className="mb-6 border-b border-gray-3 pb-5">
                <p className="font-medium text-dark">
                  {customerName || profile?.email || "Customer"}
                </p>

                {profile?.email && (
                  <p className="mt-1 break-all text-sm text-dark-4">
                    {profile.email}
                  </p>
                )}
              </div>

              <nav aria-label="Customer account">
                <div className="flex flex-wrap gap-2 xl:flex-col">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      aria-current={
                        activeTab === tab.id ? "page" : undefined
                      }
                      className={`rounded-md px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue text-white"
                          : "bg-gray-1 text-dark-2 hover:bg-blue hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="rounded-md bg-gray-1 px-4 py-3 text-left text-dark-2 transition-colors hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingOut ? "Signing out..." : "Logout"}
                  </button>
                </div>
              </nav>
            </aside>

            <main className="min-w-0 rounded-xl bg-white p-5 shadow-1 sm:p-8">
              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {isLoading && activeTab === "dashboard" && (
                <p role="status">Loading your account...</p>
              )}

              {activeTab === "dashboard" && !isLoading && dashboard && (
                <DashboardSection
                  dashboard={dashboard}
                  customerName={customerName}
                  onViewOrders={() => handleTabChange("orders")}
                />
              )}

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
                  isLoading={isAddressesLoading}
                  onAdd={openAddAddress}
                  onEdit={openEditAddress}
                  onDelete={handleDeleteAddress}
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
      />
    </>
  );
}

// DASHBOARD
function DashboardSection({
  dashboard,
  customerName,
  onViewOrders,
}: {
  dashboard: CustomerDashboard;
  customerName: string;
  onViewOrders: () => void;
}) {
  return (
    <section>
      <h1 className="mb-2 text-xl font-semibold text-dark">
        Hello{customerName ? ` ${customerName}` : ""}
      </h1>

      <p className="mb-7 text-dark-4">
        Your account summary and recent orders are shown here.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Total orders", dashboard.totalOrders],
          ["Pending orders", dashboard.pendingOrders],
          ["Processing orders", dashboard.processingOrders],
          ["Delivered orders", dashboard.deliveredOrders],
          ["Total spent", formatAmount(dashboard.totalSpent)],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-lg border border-gray-3 bg-gray-1 p-4"
          >
            <p className="text-sm text-dark-4">{label}</p>
            <p className="mt-2 text-xl font-semibold text-dark">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-dark">Recent orders</h2>

        <button
          type="button"
          onClick={onViewOrders}
          className="text-sm font-medium text-blue hover:underline"
        >
          View all orders
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-3 text-dark-4">
              <th className="px-3 py-3 font-medium">Order</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Items</th>
              <th className="px-3 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>

          <tbody>
            {dashboard.recentOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-dark-4">
                  You do not have any orders yet.
                </td>
              </tr>
            ) : (
              dashboard.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-3 last:border-0">
                  <td className="px-3 py-4 font-medium text-blue">
                    {order.orderNumber}
                  </td>
                  <td className="px-3 py-4 text-dark-4">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-3 py-4 capitalize text-dark">
                    {order.status}
                  </td>
                  <td className="px-3 py-4 text-dark-4">
                    {order.itemsCount}
                  </td>
                  <td className="px-3 py-4 text-right text-dark">
                    {formatAmount(order.totalAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ORDERS
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
      <h1 className="mb-6 text-xl font-semibold text-dark">My Orders</h1>

      {isLoading ? (
        <p role="status">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="py-5 text-dark-4">You do not have any orders yet.</p>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-3 text-dark-4">
                  <th className="px-3 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Payment</th>
                  <th className="px-3 py-3 font-medium">Items</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-3 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-3 last:border-0"
                  >
                    <td className="px-3 py-4 font-medium text-blue">
                      {order.orderNumber}
                    </td>
                    <td className="px-3 py-4 text-dark-4">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-3 py-4 capitalize text-dark">
                      {order.status}
                    </td>
                    <td className="px-3 py-4 text-dark-4">
                      {order.paymentStatus}
                    </td>
                    <td className="px-3 py-4 text-dark-4">
                      {order.itemsCount}
                    </td>
                    <td className="px-3 py-4 text-right text-dark">
                      {formatAmount(order.totalAmount)}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => onViewOrder(order.id)}
                          className="font-medium text-blue hover:underline"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => onTrackOrder(order.id)}
                          className="font-medium text-blue hover:underline"
                        >
                          Track
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => onPageChange(page - 1)}
                className="rounded-md border border-gray-3 px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-dark-4">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || isLoading}
                onClick={() => onPageChange(page + 1)}
                className="rounded-md border border-gray-3 px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isOrderDetailsLoading && (
        <p className="mt-6" role="status">Loading order details...</p>
      )}

      {selectedOrder && (
        <OrderDetailsView
          order={selectedOrder}
          onClose={onCloseDetails}
        />
      )}

      {isTrackingLoading && (
        <p className="mt-6" role="status">Loading tracking...</p>
      )}

      {tracking && (
        <OrderTrackingView
          tracking={tracking}
          onClose={onCloseTracking}
        />
      )}
    </section>
  );
}

// ORDER DETAILS
function OrderDetailsView({
  order,
  onClose,
}: {
  order: CustomerOrderDetails;
  onClose: () => void;
}) {
  return (
    <section className="mt-8 rounded-lg border border-gray-3 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-dark">
          Order Details — {order.orderNumber}
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-blue hover:underline"
        >
          Close
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <p className="text-sm text-dark-4">
          Status: <strong className="text-dark">{order.status}</strong>
        </p>
        <p className="text-sm text-dark-4">
          Payment: <strong className="text-dark">{order.paymentStatus}</strong>
        </p>
        <p className="text-sm text-dark-4">
          Payment method: <strong className="text-dark">{order.paymentMethod}</strong>
        </p>
        <p className="text-sm text-dark-4">
          Date: <strong className="text-dark">{formatDate(order.createdAt)}</strong>
        </p>
      </div>

      <h3 className="mb-3 font-semibold text-dark">Items</h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-3 text-dark-4">
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-3">
                <td className="px-3 py-3 text-dark">{item.productName}</td>
                <td className="px-3 py-3 text-dark-4">{item.sku}</td>
                <td className="px-3 py-3">{formatAmount(item.unitPrice)}</td>
                <td className="px-3 py-3">{item.quantity}</td>
                <td className="px-3 py-3 text-right">
                  {formatAmount(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
        <SummaryRow label="Subtotal" value={order.subtotal} />
        <SummaryRow label="Shipping" value={order.shippingAmount} />
        <SummaryRow label="Discount" value={order.discountAmount} />
        <SummaryRow label="Tax" value={order.taxAmount} />
        <div className="flex justify-between border-t border-gray-3 pt-3 text-base font-semibold text-dark">
          <span>Total</span>
          <span>{formatAmount(order.totalAmount)}</span>
        </div>
      </div>

      <h3 className="mb-3 mt-7 font-semibold text-dark">Addresses</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {order.addresses.map((address, index) => (
          <div
            key={`${address.type}-${index}`}
            className="rounded-md border border-gray-3 p-4"
          >
            <p className="mb-2 font-semibold text-dark">{address.type} Address</p>
            <p className="text-sm text-dark">{address.fullName}</p>
            <p className="text-sm text-dark-4">{address.phoneNumber}</p>
            <p className="mt-2 text-sm text-dark-4">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ""}
              {`, ${address.city}`}
              {address.state ? `, ${address.state}` : ""}
              {address.postalCode ? ` ${address.postalCode}` : ""}
              {`, ${address.country}`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex justify-between text-dark-4">
      <span>{label}</span>
      <span>{formatAmount(value)}</span>
    </div>
  );
}

// TRACKING
function OrderTrackingView({
  tracking,
  onClose,
}: {
  tracking: CustomerOrderTracking;
  onClose: () => void;
}) {
  return (
    <section className="mt-8 rounded-lg border border-gray-3 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-dark">
            Order Tracking
          </h2>
          <p className="mt-1 text-sm text-dark-4">
            {tracking.orderNumber} · Current status: {tracking.currentStatus}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-blue hover:underline"
        >
          Close
        </button>
      </div>

      {tracking.history.length === 0 ? (
        <p className="text-sm text-dark-4">
          No tracking history is available yet.
        </p>
      ) : (
        <div className="space-y-5">
          {tracking.history.map((item, index) => (
            <div key={`${item.status}-${item.createdAt}-${index}`} className="flex gap-3">
              <div className="mt-1 flex h-3 w-3 shrink-0 rounded-full bg-blue" />

              <div>
                <p className="font-medium text-dark">{item.status}</p>
                {item.note && (
                  <p className="mt-1 text-sm text-dark-4">{item.note}</p>
                )}
                <p className="mt-1 text-xs text-dark-4">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ADDRESSES
function AddressesSection({
  addresses,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  addresses: CustomerAddress[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (address: CustomerAddress) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}) {
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-dark">My Addresses</h1>

        <button
          type="button"
          onClick={onAdd}
          className="rounded-md bg-blue px-5 py-3 text-sm font-medium text-white hover:bg-blue-dark"
        >
          Add New Address
        </button>
      </div>

      {isLoading ? (
        <p role="status">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <div className="rounded-lg border border-gray-3 p-6 text-center">
          <p className="mb-4 text-dark-4">You have not added any addresses yet.</p>
          <button
            type="button"
            onClick={onAdd}
            className="font-medium text-blue hover:underline"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-lg border border-gray-3 p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-dark">
                  {address.type} Address
                </span>

                {address.isDefault && (
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    Default
                  </span>
                )}
              </div>

              <p className="font-medium text-dark">{address.fullName}</p>
              <p className="mt-1 text-sm text-dark-4">{address.phoneNumber}</p>

              <p className="mt-3 text-sm leading-6 text-dark-4">
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                {`, ${address.city}`}
                {address.state ? `, ${address.state}` : ""}
                {address.postalCode ? ` ${address.postalCode}` : ""}
                {`, ${address.country}`}
              </p>

              <div className="mt-5 flex flex-wrap gap-4 border-t border-gray-3 pt-4">
                <button
                  type="button"
                  onClick={() => onEdit(address)}
                  className="text-sm font-medium text-blue hover:underline"
                >
                  Edit
                </button>

                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => onSetDefault(address.id)}
                    className="text-sm font-medium text-blue hover:underline"
                  >
                    Set Default
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDelete(address.id)}
                  className="text-sm font-medium text-red hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// PROFILE
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
  const inputClass =
    "w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-2.5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

  return (
    <section>
      <h1 className="mb-6 text-xl font-semibold text-dark">
        Account Details
      </h1>

      <form onSubmit={onSubmit}>
        <div className="mb-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-dark">
              First Name *
            </label>
            <input
              required
              maxLength={100}
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
            <label className="mb-2 block text-sm text-dark">
              Last Name *
            </label>
            <input
              required
              maxLength={100}
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
          <label className="mb-2 block text-sm text-dark">
            Email Address *
          </label>
          <input
            required
            type="email"
            maxLength={256}
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

        <div className="mb-6">
          <label className="mb-2 block text-sm text-dark">
            Phone Number
          </label>
          <input
            type="tel"
            maxLength={20}
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

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-blue px-7 py-3 font-medium text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default MyAccount;
