"use client";

import React from "react";
import type { CustomerAddress } from "@/types/customer";
import {
  RadioCard,
  SavedAddressList,
  StepCard,
  inputClass,
  labelClass,
  Req,
  type SavedSelection,
} from "./CheckoutParts";

export interface AddressForm {
  firstName: string;
  lastName: string;
  companyName: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
}

export interface CheckoutFormValues {
  billing: AddressForm;
  shipping: AddressForm;
  guestPassword: string;
  useDifferentShippingAddress: boolean;
  saveAddress: boolean;
}

interface BillingProps {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
  sameAsShipping: boolean;
  onSameAsShippingChange: (value: boolean) => void;
  // Logged-in user ke saved billing addresses (optional)
  savedAddresses?: CustomerAddress[];
  selectedSavedId?: SavedSelection;
  onSelectSaved?: (selection: number | "new") => void;
}

const BillingFields = ({
  value,
  onChange,
}: {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
}) => {
  const updateField = (field: keyof AddressForm, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            First Name <Req />
          </label>
          <input
            id="firstName"
            value={value.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="John"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="lastName" className={labelClass}>
            Last Name <Req />
          </label>
          <input
            id="lastName"
            value={value.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Doe"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="companyName" className={labelClass}>
          Company Name{" "}
          <span className="font-normal text-[#6B7280]">(optional)</span>
        </label>
        <input
          id="companyName"
          value={value.companyName}
          onChange={(e) => updateField("companyName", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="mb-5">
        <label htmlFor="billingCountry" className={labelClass}>
          Country / Region <Req />
        </label>
        <input
          id="billingCountry"
          value={value.country}
          onChange={(e) => updateField("country", e.target.value)}
          placeholder="Pakistan"
          className={inputClass}
        />
      </div>

      <div className="mb-5">
        <label htmlFor="billingAddress" className={labelClass}>
          Street Address <Req />
        </label>
        <input
          id="billingAddress"
          value={value.addressLine1}
          onChange={(e) => updateField("addressLine1", e.target.value)}
          placeholder="House number and street name"
          className={inputClass}
        />
        <input
          aria-label="Address line 2"
          value={value.addressLine2}
          onChange={(e) => updateField("addressLine2", e.target.value)}
          placeholder="Apartment, suite, unit, etc. (optional)"
          className={`${inputClass} mt-3`}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="billingCity" className={labelClass}>
            Town / City <Req />
          </label>
          <input
            id="billingCity"
            value={value.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="billingState" className={labelClass}>
            State / Province
          </label>
          <input
            id="billingState"
            value={value.state}
            onChange={(e) => updateField("state", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="billingPostalCode" className={labelClass}>
            Postal Code
          </label>
          <input
            id="billingPostalCode"
            value={value.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="billingPhone" className={labelClass}>
          Phone <Req />
        </label>
        <input
          id="billingPhone"
          type="tel"
          value={value.phoneNumber}
          onChange={(e) => updateField("phoneNumber", e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
};

const Billing = ({
  value,
  onChange,
  sameAsShipping,
  onSameAsShippingChange,
  savedAddresses = [],
  selectedSavedId = null,
  onSelectSaved,
}: BillingProps) => {
  const hasSaved = savedAddresses.length > 0 && !!onSelectSaved;
  const showForm = !hasSaved || selectedSavedId === "new";

  return (
    <StepCard
      step={2}
      title="Billing details"
      subtitle="Choose how you'd like to be billed."
    >
      <div className="flex flex-col gap-3">
        <RadioCard
          name="billingOption"
          checked={sameAsShipping}
          onSelect={() => onSameAsShippingChange(true)}
        >
          <span className="block font-semibold text-dark">
            Same as shipping address
          </span>
          <span className="block text-sm text-[#4B5563]">
            Use the shipping address for billing too.
          </span>
        </RadioCard>

        <RadioCard
          name="billingOption"
          checked={!sameAsShipping}
          onSelect={() => onSameAsShippingChange(false)}
        >
          <span className="block font-semibold text-dark">
            Use a different billing address
          </span>
          <span className="block text-sm text-[#4B5563]">
            {hasSaved
              ? "Pick a saved billing address or add a new one."
              : "Enter a separate address for billing."}
          </span>
        </RadioCard>
      </div>

      {!sameAsShipping && (
        <div className="mt-6 border-t border-gray-3 pt-6">
          {hasSaved && (
            <SavedAddressList
              name="savedBilling"
              addresses={savedAddresses}
              selected={selectedSavedId}
              onSelect={onSelectSaved!}
              newLabel="Use a new billing address"
            />
          )}

          {showForm && (
            <div className={hasSaved ? "mt-6 border-t border-gray-3 pt-6" : ""}>
              <BillingFields value={value} onChange={onChange} />
            </div>
          )}
        </div>
      )}
    </StepCard>
  );
};

export default Billing;