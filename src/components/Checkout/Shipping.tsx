"use client";

import React from "react";
import type { AddressForm } from "./Billing";

interface ShippingProps {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
  isGuest: boolean;
  guestPassword: string;
  onGuestPasswordChange: (value: string) => void;
}

const inputClass =
  "h-12 w-full rounded-lg border border-[#CBD2E0] bg-white px-4 text-base text-dark outline-none duration-200 placeholder:text-[#8A94A6] hover:border-[#9AA5BC] focus:border-blue focus:ring-4 focus:ring-[#DDE3FB]";

const labelClass = "mb-2 block text-sm font-semibold text-dark";

const Req = () => <span className="ml-0.5 text-red">*</span>;

const Shipping = ({
  value,
  onChange,
  isGuest,
  guestPassword,
  onGuestPasswordChange,
}: ShippingProps) => {
  const updateField = (field: keyof AddressForm, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-3 bg-white shadow-1 sm:mt-7.5">
      <div className="flex items-center gap-3.5 border-b border-gray-3 bg-[#F8F9FC] px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-base font-bold text-white">
          1
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-dark sm:text-xl">
            Shipping details
          </h3>
          <p className="text-sm text-[#4B5563]">
            Where should we deliver your order?
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {/* Contact */}
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="shippingEmail" className={labelClass}>
              Email Address <Req />
            </label>
            <input
              id="shippingEmail"
              type="email"
              autoComplete="email"
              value={value.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shippingPhone" className={labelClass}>
              Phone <Req />
            </label>
            <input
              id="shippingPhone"
              type="tel"
              autoComplete="tel"
              value={value.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.target.value)}
              placeholder="03XX XXXXXXX"
              className={inputClass}
            />
          </div>
        </div>

        {isGuest && (
          <div className="mb-5 rounded-lg border border-[#C9D2F8] bg-[#EEF1FD] p-4">
            <label htmlFor="guestPassword" className={labelClass}>
              Create Account Password <Req />
            </label>
            <input
              id="guestPassword"
              type="password"
              autoComplete="new-password"
              value={guestPassword}
              onChange={(e) => onGuestPasswordChange(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              className={inputClass}
            />
            <p className="mt-2 text-sm text-[#374151]">
              An account will be created automatically when you place your
              order.
            </p>
          </div>
        )}

        <div className="mb-5 border-t border-gray-3" />

        {/* Name */}
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="shippingFirstName" className={labelClass}>
              First Name <Req />
            </label>
            <input
              id="shippingFirstName"
              autoComplete="given-name"
              value={value.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="John"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shippingLastName" className={labelClass}>
              Last Name <Req />
            </label>
            <input
              id="shippingLastName"
              autoComplete="family-name"
              value={value.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Doe"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="shippingCompany" className={labelClass}>
            Company Name{" "}
            <span className="font-normal text-[#6B7280]">(optional)</span>
          </label>
          <input
            id="shippingCompany"
            autoComplete="organization"
            value={value.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="shippingCountry" className={labelClass}>
            Country / Region <Req />
          </label>
          <input
            id="shippingCountry"
            autoComplete="country-name"
            value={value.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Pakistan"
            className={inputClass}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="shippingAddress" className={labelClass}>
            Street Address <Req />
          </label>
          <input
            id="shippingAddress"
            autoComplete="address-line1"
            value={value.addressLine1}
            onChange={(e) => updateField("addressLine1", e.target.value)}
            placeholder="House number and street name"
            className={inputClass}
          />

          <input
            aria-label="Address line 2"
            autoComplete="address-line2"
            value={value.addressLine2}
            onChange={(e) => updateField("addressLine2", e.target.value)}
            placeholder="Apartment, suite, unit, etc. (optional)"
            className={`${inputClass} mt-3`}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="shippingCity" className={labelClass}>
              Town / City <Req />
            </label>
            <input
              id="shippingCity"
              autoComplete="address-level2"
              value={value.city}
              onChange={(e) => updateField("city", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shippingState" className={labelClass}>
              State / Province
            </label>
            <input
              id="shippingState"
              autoComplete="address-level1"
              value={value.state}
              onChange={(e) => updateField("state", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shippingPostalCode" className={labelClass}>
              Postal Code
            </label>
            <input
              id="shippingPostalCode"
              autoComplete="postal-code"
              value={value.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;