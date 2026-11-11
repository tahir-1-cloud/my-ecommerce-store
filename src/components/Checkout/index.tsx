"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing, { type AddressForm } from "./Billing";

import { checkoutService } from "@/services/checkoutService";
import type {
  CheckoutMode,
  CheckoutResponse,
  CheckoutRequest,
  AddressRequest,
  OrderResponse,
} from "@/types/checkout";

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

const Checkout = () => {
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

  // Detect existing login
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ?? localStorage.getItem("token");

    setIsGuest(!token);
  }, []);

  // Load checkout preview from backend
  useEffect(() => {
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
          productVariantId,
          quantity,
        });

        if (isMounted) {
          setPreview(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load checkout details."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const hasRequiredAddress = (a: AddressForm) =>
    !!a.firstName.trim() &&
    !!a.lastName.trim() &&
    !!a.phoneNumber.trim() &&
    !!a.addressLine1.trim() &&
    !!a.city.trim() &&
    !!a.country.trim();

  const handlePlaceOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!preview || preview.items.length === 0) {
      toast.error("No checkout items found.");
      return;
    }

    // Same as shipping: shipping hi billing ban jati hai
    const selectedBillingAddress = billingSameAsShipping
      ? shippingAddress
      : billingAddress;

    if (!shippingAddress.email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!hasRequiredAddress(shippingAddress)) {
      toast.error("Please complete all required shipping fields.");
      return;
    }

    if (!billingSameAsShipping && !hasRequiredAddress(billingAddress)) {
      toast.error("Please complete all required billing fields.");
      return;
    }

    if (isGuest && !guestPassword.trim()) {
      toast.error("Please enter a password to create your account.");
      return;
    }

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

      shippingAddress: mapAddress(shippingAddress),
      billingAddress: mapAddress(selectedBillingAddress),

      saveAddress: false,
    };

    try {
      setIsSubmitting(true);

      const result = await checkoutService.placeOrder(request);

      // Save guest authentication tokens returned by backend
      if (result.authentication) {
        localStorage.setItem("accessToken", result.authentication.accessToken);
        localStorage.setItem(
          "refreshToken",
          result.authentication.refreshToken
        );

        setIsGuest(false);
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

  if (placedOrder) {
    return (
      <>
        <Breadcrumb title="Order Confirmation" pages={["checkout"]} />

        <section className="bg-gray-2 py-14 sm:py-20">
          <div className="mx-auto max-w-[620px] px-4">
            <div className="rounded-[10px] bg-white p-6 text-center shadow-1 sm:p-10">
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green/10 text-green">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
              <p className="mb-6 text-dark-4">
                Your order has been placed successfully.
              </p>

              <div className="mb-8 divide-y divide-gray-3 rounded-lg bg-gray-1 text-left">
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-dark-4">Order Number</span>
                  <strong className="text-dark">
                    {placedOrder.orderNumber}
                  </strong>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-dark-4">Total</span>
                  <strong className="text-blue">
                    ${placedOrder.totalAmount.toFixed(2)}
                  </strong>
                </div>
              </div>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex rounded-md bg-blue px-8 py-3 font-medium text-white duration-200 ease-out hover:bg-blue-dark"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Checkout" pages={["checkout"]} />

      <section className="overflow-hidden bg-gray-2 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <form onSubmit={handlePlaceOrder} noValidate>
            <div className="flex flex-col gap-7.5 lg:flex-row xl:gap-11">
              {/* Checkout left */}
              <div className="w-full lg:max-w-[670px]">
                {isGuest && <Login />}

                <Shipping
                  value={shippingAddress}
                  onChange={setShippingAddress}
                  isGuest={isGuest}
                  guestPassword={guestPassword}
                  onGuestPasswordChange={setGuestPassword}
                />

                <Billing
                  value={billingAddress}
                  onChange={setBillingAddress}
                  sameAsShipping={billingSameAsShipping}
                  onSameAsShippingChange={setBillingSameAsShipping}
                />

                {/* Order notes - UI only for now */}
                <div className="mt-7.5 rounded-[10px] bg-white p-4 shadow-1 sm:p-8.5">
                  <label
                    htmlFor="notes"
                    className="mb-2.5 block text-custom-sm font-medium text-dark"
                  >
                    Other Notes (optional)
                  </label>

                  <textarea
                    name="notes"
                    id="notes"
                    rows={4}
                    placeholder="Notes about your order..."
                    className="w-full rounded-md border border-gray-3 bg-gray-1 p-5 outline-none duration-200 focus:border-blue focus:bg-white focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              {/* Checkout right */}
              <div className="w-full lg:max-w-[455px]">
                <div className="lg:sticky lg:top-32">
                  {/* Order summary */}
                  <div className="rounded-[10px] bg-white shadow-1">
                    <div className="flex items-center justify-between border-b border-gray-3 px-4 py-5 sm:px-8.5">
                      <h3 className="text-xl font-medium text-dark">
                        Your Order
                      </h3>
                      {preview && preview.items.length > 0 && (
                        <span className="rounded-full bg-blue/10 px-3 py-1 text-custom-sm font-medium text-blue">
                          {preview.items.length}{" "}
                          {preview.items.length === 1 ? "item" : "items"}
                        </span>
                      )}
                    </div>

                    <div className="px-4 pb-8 pt-2 sm:px-8.5">
                      {isLoading ? (
                        <div className="space-y-4 py-6">
                          {[0, 1].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-2" />
                              <div className="flex-1 space-y-2">
                                <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-2" />
                                <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <p className="py-8 text-center text-red">{error}</p>
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
                                  className="flex items-center gap-4 py-5"
                                >
                                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F6F7FB] ring-1 ring-gray-3">
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
                                      <span className="flex h-full w-full items-center justify-center text-dark-4">
                                        <svg
                                          width="22"
                                          height="22"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.4"
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
                                    <p className="line-clamp-2 font-medium text-dark">
                                      {item.productName}
                                    </p>
                                    <p className="text-custom-sm text-dark-4">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>

                                  <p className="shrink-0 font-medium text-dark">
                                    ${item.totalPrice.toFixed(2)}
                                  </p>
                                </li>
                              );
                            })}
                          </ul>

                          <div className="space-y-3.5 border-t border-gray-3 pt-5">
                            <div className="flex justify-between text-dark">
                              <p>Subtotal</p>
                              <p>${subtotal.toFixed(2)}</p>
                            </div>

                            <div className="flex justify-between text-dark">
                              <p>Shipping Fee</p>
                              <p>
                                {shippingFee === 0
                                  ? "Free"
                                  : `$${shippingFee.toFixed(2)}`}
                              </p>
                            </div>

                            {discount > 0 && (
                              <div className="flex justify-between text-green">
                                <p>Discount</p>
                                <p>-${discount.toFixed(2)}</p>
                              </div>
                            )}

                            {tax > 0 && (
                              <div className="flex justify-between text-dark">
                                <p>Tax</p>
                                <p>${tax.toFixed(2)}</p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="py-8 text-center text-dark-4">
                          Your cart is empty.
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-1 px-4 py-4">
                        <p className="text-lg font-medium text-dark">Total</p>
                        <p className="text-xl font-semibold text-blue">
                          ${grandTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Coupon />

                  <ShippingMethod />

                  <PaymentMethod />

                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      isSubmitting ||
                      !!error ||
                      !preview ||
                      preview.items.length === 0
                    }
                    className="mt-7.5 flex h-12 w-full items-center justify-center gap-2.5 rounded-md bg-blue px-6 font-medium text-white duration-200 ease-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Placing Order...
                      </>
                    ) : (
                      <>Place Order · ${grandTotal.toFixed(2)}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;