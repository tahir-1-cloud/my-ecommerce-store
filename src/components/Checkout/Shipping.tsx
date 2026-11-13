
"use client";

import React from "react";
import type { AddressForm } from "./Billing";
import { StepCard, inputClass, labelClass, Req } from "./CheckoutParts";

interface ShippingFieldsProps {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
  isGuest: boolean;
  guestPassword: string;
  onGuestPasswordChange: (value: string) => void;
  lockEmail?: boolean;
  addressOnly?: boolean;
}

export const ShippingFields = ({
  value,
  onChange,
  isGuest,
  guestPassword,
  onGuestPasswordChange,
  lockEmail = false,
  addressOnly = false,
}: ShippingFieldsProps) => {
  const updateField = (field: keyof AddressForm, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div>
      {!addressOnly && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="shippingEmail" className={labelClass}>
                Email Address <Req />
              </label>
              <input
                id="shippingEmail"
                type="email"
                autoComplete="email"
                readOnly={lockEmail}
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
                An account will be created automatically when you place your order.
              </p>
            </div>
          )}

          <div className="mb-5 border-t border-gray-3" />

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
        </>
      )}

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
  );
};

interface ShippingProps extends ShippingFieldsProps {}

const Shipping = (props: ShippingProps) => (
  <StepCard
    step={1}
    title="Shipping details"
    subtitle="Where should we deliver your order?"
  >
    <ShippingFields {...props} />
  </StepCard>
);

export default Shipping;
