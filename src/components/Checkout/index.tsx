"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping, { ShippingFields } from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing, { type AddressForm } from "./Billing";
import {
  SavedAddressList,
  StepCard,
  btnOutline,
  btnPrimary,
  type SavedSelection,
} from "./CheckoutParts";

import { checkoutService } from "@/services/checkoutService";
import { saveAuthSession } from "@/services/authService";
import { customerService } from "@/services/customerService";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  removeAllItemsFromCart,
} from "@/redux/features/cart-slice";

import type {
  CheckoutMode,
  CheckoutResponse,
  CheckoutRequest,
  AddressRequest,
  OrderResponse,
} from "@/types/checkout";
import type { CustomerAddress, CustomerProfile } from "@/types/customer";

import toast from "react-hot-toast";

const emptyAddress: AddressForm = {
  firstName: "",
  lastName: "",
  companyName: "",
  country: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  phoneNumber: "",
  email: "",
};

type ShippingMode = "saved" | "new" | "edit";

const isType = (address: CustomerAddress, type: string) =>
  String(address.type).toLowerCase() === type;

const defaultFirst = (list: CustomerAddress[]) =>
  [...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

const toAddressForm = (a: CustomerAddress, email: string): AddressForm => {
  const parts = a.fullName.trim().split(/\s+/);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    companyName: "",
    country: a.country ?? "",
    addressLine1: a.addressLine1 ?? "",
    addressLine2: a.addressLine2 ?? "",
    city: a.city ?? "",
    state: a.state ?? "",
    postalCode: a.postalCode ?? "",
    phoneNumber: a.phoneNumber ?? "",
    email,
  };
};

const sameAddress = (a: CustomerAddress, b: CustomerAddress) =>
  [a.addressLine1, a.city, a.postalCode, a.country]
    .map((v) => String(v ?? "").trim().toLowerCase())
    .join("|") ===
  [b.addressLine1, b.city, b.postalCode, b.country]
    .map((v) => String(v ?? "").trim().toLowerCase())
    .join("|");

const hasRequiredAddress = (a: AddressForm) =>
  !!a.firstName.trim() &&
  !!a.lastName.trim() &&
  !!a.phoneNumber.trim() &&
  !!a.addressLine1.trim() &&
  !!a.city.trim() &&
  !!a.country.trim();



const hasRequiredAddressFields = (a: AddressForm) =>
  !!a.addressLine1.trim() &&
  !!a.city.trim() &&
  !!a.country.trim();


const mapAddress = (address: AddressForm): AddressRequest => ({
  fullName: `${address.firstName} ${address.lastName}`.trim(),
  phoneNumber: address.phoneNumber.trim(),
  addressLine1: address.addressLine1.trim(),
  addressLine2: address.addressLine2?.trim() || null,
  city: address.city.trim(),
  state: address.state?.trim() || null,
  postalCode: address.postalCode?.trim() || null,
  country: address.country.trim(),
});

const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
);

const Checkout = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();

  const [shippingAddress, setShippingAddress] =
    useState<AddressForm>(emptyAddress);
  const [billingAddress, setBillingAddress] =
    useState<AddressForm>(emptyAddress);

  // true: shipping hi billing hai | false: alag billing address
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  const [guestPassword, setGuestPassword] = useState("");
  const [isGuest, setIsGuest] = useState(true);

  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("Cart");
  const [preview, setPreview] = useState<CheckoutResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);

  // Logged-in customer
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [savedShipping, setSavedShipping] = useState<CustomerAddress[]>([]);
  const [savedBilling, setSavedBilling] = useState<CustomerAddress[]>([]);
  const [shippingMode, setShippingMode] = useState<ShippingMode>("new");
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [selectedBillingId, setSelectedBillingId] =
    useState<SavedSelection>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  /* ---------- Customer data ---------- */

  const [customerPhone, setCustomerPhone] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");

const applyCustomer = (
  profile: CustomerProfile,
  addresses: CustomerAddress[]
) => {
  const ship = defaultFirst(
    addresses.filter((a) => isType(a, "shipping"))
  );

  const bill = defaultFirst(
    addresses.filter((a) => isType(a, "billing"))
  );

  const email = profile.email ?? "";
  const firstName = profile.firstName ?? "";
  const lastName = profile.lastName ?? "";
    const phone =
      profile.phoneNumber?.trim() ||
      ship[0]?.phoneNumber?.trim() ||
      bill[0]?.phoneNumber?.trim() ||
      "";

  setIsGuest(false);

  setCustomerFirstName(firstName);
  setCustomerLastName(lastName);
  setCustomerName(`${firstName} ${lastName}`.trim());
  setCustomerEmail(email);
  setCustomerPhone(phone);

  setSavedShipping(ship);
  setSavedBilling(bill);

  // Always show saved information first.
  // Never automatically open the address form.
  setShippingMode("saved");

  if (ship.length > 0) {
    setSelectedShippingId(ship[0].id);
    setShippingAddress(toAddressForm(ship[0], email));
  } else {
    setSelectedShippingId(null);

    setShippingAddress({
      ...emptyAddress,
      firstName,
      lastName,
      phoneNumber: phone,
      email,
    });
  }

  const billingDiffers =
    bill.length > 0 &&
    (ship.length === 0 || !sameAddress(bill[0], ship[0]));

  if (billingDiffers) {
    setBillingSameAsShipping(false);
    setSelectedBillingId(bill[0].id);
    setBillingAddress(toAddressForm(bill[0], email));
  } else {
    setBillingSameAsShipping(true);
    setSelectedBillingId(null);
    setBillingAddress(emptyAddress);
  }
};

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const token =
        localStorage.getItem("accessToken") ?? localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setIsGuest(true);
          setIsAuthLoading(false);
        }
        return;
      }

      // Token hai: existing customer
      if (isMounted) setIsGuest(false);

      try {
        const [profile, addresses] = await Promise.all([
          customerService.getProfile(),
          customerService.getAddresses(),
        ]);

        if (isMounted) applyCustomer(profile, addresses);
      } catch {
        if (isMounted) toast.error("Unable to load your customer information.");
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckoutLoginSuccess = async () => {
    setIsAuthLoading(true);

    try {
      const [profile, addresses] = await Promise.all([
        customerService.getProfile(),
        customerService.getAddresses(),
      ]);

      applyCustomer(profile, addresses);
    } catch {
      toast.error("Unable to load your customer information.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  /* ---------- Checkout preview ---------- */

  // Guest ke cart badalne par hi dobara load ho (logged-in par nahi)
  const guestCartKey = isGuest
    ? JSON.stringify(cartItems.map((item) => [item.id, item.quantity]))
    : "";

  useEffect(() => {
    if (isAuthLoading || placedOrder) return;

    let isMounted = true;

    const loadPreview = async () => {
      try {
        setIsLoading(true);
        setError("");

        const params = new URLSearchParams(window.location.search);

        const urlMode = params.get("mode");
        const mode: CheckoutMode = urlMode === "buy-now" ? "BuyNow" : "Cart";

        setCheckoutMode(mode);

        let productVariantId: number | undefined;
        let quantity = 1;

        if (mode === "BuyNow") {
          productVariantId = Number(
            params.get("productVariantId") ?? params.get("variantId")
          );

          quantity = Number(params.get("quantity") ?? 1);

          if (
            !Number.isInteger(productVariantId) ||
            productVariantId <= 0 ||
            !Number.isInteger(quantity) ||
            quantity <= 0
          ) {
            throw new Error("Invalid checkout information.");
          }
        }

        const result = await checkoutService.getPreview({
          mode,
          ...(mode === "BuyNow" && { productVariantId, quantity }),
          ...(isGuest &&
            mode === "Cart" && {
              guestCartItems: cartItems.map((item) => ({
                productVariantId: item.id,
                quantity: item.quantity,
              })),
            }),
        });

        if (isMounted) setPreview(result);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load checkout details."
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, isGuest, guestCartKey, placedOrder]);

  /* ---------- Address selection ---------- */

const handleSelectShipping = (selection: number | "new") => {
  if (selection === "new") {
    setSelectedShippingId(null);
    setShippingMode("new");

    setShippingAddress({
      ...emptyAddress,
      firstName: customerFirstName,
      lastName: customerLastName,
      phoneNumber: customerPhone,
      email: customerEmail,
    });

    return;
  }

  const address = savedShipping.find((a) => a.id === selection);
  if (!address) return;

  setSelectedShippingId(address.id);
  setShippingAddress(toAddressForm(address, customerEmail));
  setShippingMode("saved");
};

const handleEditShipping = (address: CustomerAddress) => {
  setSelectedShippingId(address.id);
  setShippingAddress(toAddressForm(address, customerEmail));
  setShippingMode("edit");
};

const handleCancelEdit = () => {
  const address = savedShipping.find(
    (a) => a.id === selectedShippingId
  );

  if (address) {
    setShippingAddress(toAddressForm(address, customerEmail));
  }

  setShippingMode("saved");
};

const handleSaveShippingAddress = async () => {
  if (selectedShippingId === null) return;

  if (!hasRequiredAddressFields(shippingAddress)) {
    toast.error("Please complete your shipping address.");
    return;
  }

  const current = savedShipping.find(
    (a) => a.id === selectedShippingId
  );

  try {
    setIsSavingAddress(true);

    await customerService.updateAddress(selectedShippingId, {
      type: "Shipping",
      fullName: customerName,
      phoneNumber: customerPhone,
      addressLine1: shippingAddress.addressLine1.trim(),
      addressLine2: shippingAddress.addressLine2.trim() || null,
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim() || null,
      postalCode: shippingAddress.postalCode.trim() || null,
      country: shippingAddress.country.trim(),
      isDefault: current?.isDefault ?? false,
    });

    const addresses = await customerService.getAddresses();

    const ship = defaultFirst(
      addresses.filter((a) => isType(a, "shipping"))
    );

    const bill = defaultFirst(
      addresses.filter((a) => isType(a, "billing"))
    );

    setSavedShipping(ship);
    setSavedBilling(bill);

    const updated = ship.find(
      (a) => a.id === selectedShippingId
    );

    if (updated) {
      setSelectedShippingId(updated.id);
      setShippingAddress(toAddressForm(updated, customerEmail));
    } else {
      const fallback = ship.find((a) => a.isDefault) ?? ship[0];

      setSelectedShippingId(fallback?.id ?? null);

      if (fallback) {
        setShippingAddress(toAddressForm(fallback, customerEmail));
      }
    }

    setShippingMode("saved");

    toast.success("Shipping address updated successfully.");
  } catch (err) {
    toast.error(
      err instanceof Error
        ? err.message
        : "Unable to update shipping address."
    );
  } finally {
    setIsSavingAddress(false);
  }
};

const handleAddShippingAddress = async (): Promise<void> => {
  if (!hasRequiredAddressFields(shippingAddress)) {
    toast.error("Please enter country, address and city.");
    return;
  }

  if (!customerName.trim()) {
    toast.error("Customer name is missing from your profile.");
    return;
  }

  if (!customerPhone.trim()) {
    toast.error("Customer phone number is missing from your profile.");
    return;
  }

  try {
    setIsSavingAddress(true);

    await customerService.createAddress({
      type: "Shipping",
      fullName: customerName,
      phoneNumber: customerPhone,
      addressLine1: shippingAddress.addressLine1.trim(),
      addressLine2: shippingAddress.addressLine2?.trim() || null,
      city: shippingAddress.city.trim(),
      state: shippingAddress.state?.trim() || null,
      postalCode: shippingAddress.postalCode?.trim() || null,
      country: shippingAddress.country.trim(),
      isDefault: savedShipping.length === 0,
    });

    const addresses = await customerService.getAddresses();

    const shippingAddresses = defaultFirst(
      addresses.filter((address) => isType(address, "shipping"))
    );

    setSavedShipping(shippingAddresses);

    const selectedAddress =
      shippingAddresses.find((address) => address.isDefault) ??
      shippingAddresses[0];

    if (!selectedAddress) {
      throw new Error("Address was saved but could not be loaded.");
    }

    setSelectedShippingId(selectedAddress.id);
    setShippingAddress(toAddressForm(selectedAddress, customerEmail));
    setShippingMode("saved");

    toast.success("Shipping address added successfully.");
  } catch (err) {
    toast.error(
      err instanceof Error
        ? err.message
        : "Unable to add shipping address."
    );
  } finally {
    setIsSavingAddress(false);
  }
};



  const handleSelectBilling = (selection: number | "new") => {
    if (selection === "new") {
      setSelectedBillingId("new");
      setBillingAddress({ ...emptyAddress });
      return;
    }

    const address = savedBilling.find((a) => a.id === selection);
    if (!address) return;

    setSelectedBillingId(address.id);
    setBillingAddress(toAddressForm(address, customerEmail));
  };

  const handleBillingSameChange = (same: boolean) => {
    setBillingSameAsShipping(same);

    // "Different" par saved billing ho to pehla khud select ho jaye
    if (!same && savedBilling.length > 0 && selectedBillingId === null) {
      handleSelectBilling(savedBilling[0].id);
    }
  };





  /* ---------- Place order ---------- */

  const handlePlaceOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!preview || preview.items.length === 0) {
      toast.error("No checkout items found.");
      return;
    }

      const shippingRequest: AddressRequest = isGuest
    ? mapAddress(shippingAddress)
    : {
        ...mapAddress(shippingAddress),
        fullName: customerName,
        phoneNumber: customerPhone,
      };

  const billingRequest: AddressRequest = billingSameAsShipping
    ? shippingRequest
    : isGuest
      ? mapAddress(billingAddress)
      : {
          ...mapAddress(billingAddress),
          fullName: customerName,
          phoneNumber: customerPhone,
        };

      if (!isGuest && !customerPhone.trim()) {
    toast.error("Please add a phone number to your customer profile.");
    return;
  }
      if (!isGuest && (shippingMode === "edit" || shippingMode === "new")) {
      toast.error("Please save or cancel your address changes first.");
      return;
    }



    if (!shippingAddress.email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

if (
      isGuest
        ? !hasRequiredAddress(shippingAddress)
        : !hasRequiredAddressFields(shippingAddress)
    ) {
      toast.error("Please complete all required shipping fields.");
      return;
    }

      if (
      !billingSameAsShipping &&
      (isGuest
        ? !hasRequiredAddress(billingAddress)
        : !hasRequiredAddressFields(billingAddress))
    ) {
      toast.error("Please complete all required billing fields.");
      return;
    }

    if (isGuest && !guestPassword.trim()) {
      toast.error("Please enter a password to create your account.");
      return;
    }

    // Naya address enter hua ho tabhi save ho (saved address duplicate na bane)
    const enteredNewShipping = isGuest || shippingMode === "new";
    const enteredNewBilling =
      !billingSameAsShipping &&
      (savedBilling.length === 0 || selectedBillingId === "new");

    const request: CheckoutRequest = {
      mode: checkoutMode,
      quantity: checkoutMode === "BuyNow" ? preview.items[0].quantity : 1,

      productVariantId:
        checkoutMode === "BuyNow" ? preview.items[0].productVariantId : null,

      guestAccount: isGuest
        ? {
            firstName: shippingAddress.firstName.trim(),
            lastName: shippingAddress.lastName.trim(),
            email: shippingAddress.email.trim(),
            password: guestPassword,
          }
        : null,

      guestCartItems:
        isGuest && checkoutMode === "Cart"
          ? cartItems.map((item) => ({
              productVariantId: item.id,
              quantity: item.quantity,
            }))
          : undefined,

      shippingAddress: shippingRequest,
      billingAddress: billingRequest,

      saveAddress: enteredNewShipping || enteredNewBilling,
    };

    try {
      setIsSubmitting(true);

      const result = await checkoutService.placeOrder(request);

      if (result.authentication) {
        saveAuthSession(result.authentication);
        setIsGuest(false);
      }

      if (checkoutMode === "Cart") {
        dispatch(removeAllItemsFromCart());
      }

      setPlacedOrder(result.order);
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to place your order."
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  
  const subtotal = preview?.subtotal ?? 0;
  const shippingFee = preview?.shippingAmount ?? 0;
  const discount = preview?.discountAmount ?? 0;
  const tax = preview?.taxAmount ?? 0;
  const grandTotal = preview?.totalAmount ?? 0;

  const canSubmit =
    !isAuthLoading &&
    !isLoading &&
    !isSubmitting &&
    !error &&
    !!preview &&
    preview.items.length > 0;

  /* ---------- Order confirmation ---------- */

  if (placedOrder) {
    return (
      <>
        <Breadcrumb title="Order Confirmation" pages={["checkout"]} />

        <section className="bg-gray-2 py-14 antialiased sm:py-20">
          <div className="mx-auto max-w-[620px] px-4">
            <div className="rounded-xl border border-gray-3 bg-white p-6 text-center shadow-1 sm:p-10">
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E3F6EB] text-green">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>

              <h2 className="mb-2 text-2xl font-semibold text-dark">
                Thank you for your order!
              </h2>
              <p className="mb-6 text-[#4B5563]">
                Your order has been placed successfully.
              </p>

              <div className="mb-8 divide-y divide-gray-3 rounded-lg border border-gray-3 bg-[#F8F9FC] text-left">
                <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <span className="text-[#4B5563]">Order Number</span>
                  <strong className="text-dark">
                    {placedOrder.orderNumber}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <span className="text-[#4B5563]">Total</span>
                  <strong className="text-blue">
                    ${placedOrder.totalAmount.toFixed(2)}
                  </strong>
                </div>
              </div>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex h-12 items-center rounded-lg bg-blue px-8 font-semibold text-white duration-200 ease-out hover:bg-blue-dark"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ---------- Checkout ---------- */

  const hasSavedShipping = !isGuest && savedShipping.length > 0;

  return (
    <>
      <Breadcrumb title="Checkout" pages={["checkout"]} />

      <section className="bg-gray-2 pb-6 pt-10 antialiased sm:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <form onSubmit={handlePlaceOrder} noValidate>
            <div className="flex flex-col gap-6 lg:flex-row xl:gap-11">
            
{/* Checkout left */}
<div className="w-full lg:max-w-[670px]">

  {/* Guest login */}
  {isGuest && !isAuthLoading && (
    <Login onLoginSuccess={handleCheckoutLoginSuccess} />
  )}

  {isAuthLoading ? (
    <div className="space-y-4 rounded-xl border border-gray-3 bg-white p-6 shadow-1 sm:p-8">
      <div className="h-6 w-1/3 animate-pulse rounded bg-gray-3" />
      <div className="h-24 animate-pulse rounded-lg bg-gray-2" />
    </div>
  ) : isGuest ? (
    /* Guest checkout */
    <Shipping
      value={shippingAddress}
      onChange={setShippingAddress}
      isGuest={true}
      guestPassword={guestPassword}
      onGuestPasswordChange={setGuestPassword}
      lockEmail={false}
    />
  ) : (
    /* Logged-in customer */
    <StepCard
      step={1}
      title="Shipping Information"
      subtitle="Your personal and delivery information."
    >
      {/* Customer profile - always visible */}
      <div className="mb-6 rounded-lg border border-gray-3 bg-[#F8F9FC] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8EDFF] text-blue">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
          </div>

          <div>
            <p className="font-semibold text-dark">
              {customerName}
            </p>
            <p className="text-xs text-green">
              Logged in
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-gray-3 pt-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[#6B7280]">Email address</p>
            <p className="mt-1 break-all text-sm font-medium text-dark">
              {customerEmail}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#6B7280]">Phone number</p>
            <p className="mt-1 text-sm font-medium text-dark">
              {customerPhone || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Address heading */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-dark">
            Delivery Address
          </h4>
          <p className="text-sm text-[#6B7280]">
            Where should we deliver your order?
          </p>
        </div>
      </div>

      {/* Edit or Add address form */}
      {shippingMode === "edit" || shippingMode === "new" ? (
        <div className="rounded-lg border border-blue/30 bg-white p-4 sm:p-5">
          <h4 className="mb-5 font-semibold text-dark">
            {shippingMode === "edit"
              ? "Update Delivery Address"
              : "Add Delivery Address"}
          </h4>

          <ShippingFields
            value={shippingAddress}
            onChange={setShippingAddress}
            isGuest={false}
            guestPassword=""
            onGuestPasswordChange={() => undefined}
            lockEmail
          />

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-3 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                if (shippingMode === "edit") {
                  handleCancelEdit();
                } else {
                  setShippingMode("saved");

                  const selected = savedShipping.find(
                    (a) => a.id === selectedShippingId
                  );

                  if (selected) {
                    setShippingAddress(
                      toAddressForm(selected, customerEmail)
                    );
                  }
                }
              }}
              disabled={isSavingAddress}
              className={btnOutline}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                shippingMode === "edit"
                  ? handleSaveShippingAddress
                  : handleAddShippingAddress
              }
              disabled={isSavingAddress}
              className={btnPrimary}
            >
              {isSavingAddress
                ? "Saving..."
                : shippingMode === "edit"
                  ? "Update Address"
                  : "Save Address"}
            </button>
          </div>
        </div>
      ) : savedShipping.length > 0 ? (
        /* Saved address information */
        <SavedAddressList
          name="savedShipping"
          addresses={savedShipping}
          selected={selectedShippingId}
          onSelect={handleSelectShipping}
          onEdit={handleEditShipping}
        />
      ) : (
        /* No saved address */
        <div className="rounded-lg border border-dashed border-gray-3 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF1FD] text-blue">
            <svg width="23" height="23" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>

          <h4 className="font-semibold text-dark">
            No delivery address yet
          </h4>

          <p className="mt-1 text-sm text-[#6B7280]">
            Add your delivery address to complete your order.
          </p>

          <button
            type="button"
            onClick={() => {
              setShippingMode("new");
              setShippingAddress({
                ...emptyAddress,
                firstName: customerFirstName,
                lastName: customerLastName,
                phoneNumber: customerPhone,
                email: customerEmail,
              });
            }}
            className={`${btnPrimary} mt-4`}
          >
            Add Address
          </button>
        </div>
      )}
    </StepCard>
  )}

  {/* Billing */}
  {!isAuthLoading && (
    <Billing
      value={billingAddress}
      onChange={setBillingAddress}
      sameAsShipping={billingSameAsShipping}
      onSameAsShippingChange={handleBillingSameChange}
      savedAddresses={isGuest ? [] : savedBilling}
      selectedSavedId={selectedBillingId}
      onSelectSaved={handleSelectBilling}
    />
  )}

  {/* Order notes */}
  <div className="mt-6 rounded-xl border border-gray-3 bg-white p-4 shadow-1 sm:p-8">
    <label
      htmlFor="notes"
      className="mb-2 block text-sm font-semibold text-dark"
    >
      Other Notes{" "}
      <span className="font-normal text-[#6B7280]">
        (optional)
      </span>
    </label>

    <textarea
      name="notes"
      id="notes"
      rows={4}
      placeholder="Notes about your order, e.g. special delivery instructions"
      className="w-full rounded-lg border border-[#CBD2E0] bg-white p-4 text-base text-dark outline-none duration-200 placeholder:text-[#8A94A6] hover:border-[#9AA5BC] focus:border-blue focus:ring-4 focus:ring-[#DDE3FB]"
    />
  </div>
</div>


              {/* Checkout right */}
              <div className="w-full lg:max-w-[455px]">
                <div className="lg:sticky lg:top-32">
                  {/* Order summary */}
                  <div className="overflow-hidden rounded-xl border border-gray-3 bg-white shadow-1">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-3 bg-[#F8F9FC] px-4 py-4 sm:px-8 sm:py-5">
                      <h3 className="text-lg font-semibold text-dark sm:text-xl">
                        Your Order
                      </h3>
                      {preview && preview.items.length > 0 && (
                        <span className="rounded-full bg-blue px-3 py-1 text-sm font-semibold text-white">
                          {preview.items.length}{" "}
                          {preview.items.length === 1 ? "item" : "items"}
                        </span>
                      )}
                    </div>

                    <div className="px-4 pb-6 pt-2 sm:px-8 sm:pb-8">
                      {isLoading ? (
                        <div className="space-y-4 py-6">
                          {[0, 1].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-3" />
                              <div className="flex-1 space-y-2">
                                <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-3" />
                                <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <p className="py-8 text-center font-medium text-red">
                          {error}
                        </p>
                      ) : preview && preview.items.length > 0 ? (
                        <>
                          <ul className="divide-y divide-gray-3">
                            {preview.items.map((item) => {
                              // Backend image field ka naam alag ho to sirf yahan badlo
                              const image = (
                                item as typeof item & {
                                  imageUrl?: string | null;
                                }
                              ).imageUrl;

                              return (
                                <li
                                  key={item.productVariantId}
                                  className="flex items-center gap-4 py-4"
                                >
                                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-3 bg-[#F6F7FB]">
                                    {image ? (
                                      <Image
                                        src={image}
                                        alt={item.productName}
                                        fill
                                        sizes="64px"
                                        unoptimized
                                        className="object-contain p-1.5"
                                      />
                                    ) : (
                                      <span className="flex h-full w-full items-center justify-center text-[#6B7280]">
                                        <svg
                                          width="22"
                                          height="22"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          aria-hidden="true"
                                        >
                                          <rect x="3" y="3" width="18" height="18" rx="2" />
                                          <circle cx="8.5" cy="8.5" r="1.5" />
                                          <path d="M21 15L16 10L5 21" />
                                        </svg>
                                      </span>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 font-semibold text-dark">
                                      {item.productName}
                                    </p>
                                    <p className="text-sm text-[#4B5563]">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>

                                  <p className="shrink-0 font-semibold text-dark">
                                    ${item.totalPrice.toFixed(2)}
                                  </p>
                                </li>
                              );
                            })}
                          </ul>

                          <div className="space-y-3 border-t border-gray-3 pt-5 text-[15px]">
                            <div className="flex justify-between text-dark">
                              <p>Subtotal</p>
                              <p className="font-medium">
                                ${subtotal.toFixed(2)}
                              </p>
                            </div>

                            <div className="flex justify-between text-dark">
                              <p>Shipping Fee</p>
                              <p className="font-medium">
                                {shippingFee === 0
                                  ? "Free"
                                  : `$${shippingFee.toFixed(2)}`}
                              </p>
                            </div>

                            {discount > 0 && (
                              <div className="flex justify-between text-green">
                                <p>Discount</p>
                                <p className="font-medium">
                                  -${discount.toFixed(2)}
                                </p>
                              </div>
                            )}

                            {tax > 0 && (
                              <div className="flex justify-between text-dark">
                                <p>Tax</p>
                                <p className="font-medium">
                                  ${tax.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="py-8 text-center text-[#4B5563]">
                          Your cart is empty.
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between rounded-lg border border-[#C9D2F8] bg-[#EEF1FD] px-4 py-4">
                        <p className="text-lg font-semibold text-dark">Total</p>
                        <p className="text-xl font-bold text-blue">
                          ${grandTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Coupon />

                  <ShippingMethod />

                  <PaymentMethod />

                  {/* Desktop button */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-6 hidden h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-blue px-6 text-base font-semibold text-white duration-200 ease-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60 sm:mt-7.5 lg:flex"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        Placing Order...
                      </>
                    ) : (
                      <>Place Order · ${grandTotal.toFixed(2)}</>
                    )}
                  </button>

                  <p className="mt-3 hidden text-center text-sm text-[#4B5563] lg:block">
                    Your information is secure and encrypted.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile sticky bar: sirf form ke andar, footer par nahi aata */}
            <div className="sticky bottom-0 z-40 -mx-4 mt-6 border-t border-gray-3 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] sm:-mx-8 sm:px-8 lg:hidden">
              <div className="mx-auto flex max-w-[640px] items-center gap-4">
                <div className="shrink-0">
                  <p className="text-xs font-medium text-[#4B5563]">Total</p>
                  <p className="text-lg font-bold leading-tight text-dark">
                    ${grandTotal.toFixed(2)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex h-12 flex-1 items-center justify-center gap-2.5 rounded-lg bg-blue px-5 text-base font-semibold text-white duration-200 ease-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;