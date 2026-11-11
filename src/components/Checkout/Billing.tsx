"use client";

import React from "react";

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
}

const inputClass =
  "h-12 w-full rounded-lg border border-[#CBD2E0] bg-white px-4 text-base text-dark outline-none duration-200 placeholder:text-[#8A94A6] hover:border-[#9AA5BC] focus:border-blue focus:ring-4 focus:ring-[#DDE3FB]";

const labelClass = "mb-2 block text-sm font-semibold text-dark";

const Req = () => <span className="ml-0.5 text-red">*</span>;

const RadioOption = ({
  checked,
  onSelect,
  title,
  description,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) => (
  <label
    className={`flex cursor-pointer items-start gap-3.5 rounded-lg border-2 p-4 duration-200 ease-out ${
      checked
        ? "border-blue bg-[#EEF1FD]"
        : "border-gray-3 bg-white hover:border-[#9AA5BC]"
    }`}
  >
    <input
      type="radio"
      name="billingOption"
      checked={checked}
      onChange={onSelect}
      className="sr-only"
    />
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white ${
        checked ? "border-blue" : "border-[#9AA5BC]"
      }`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-blue" />}
    </span>
    <span className="min-w-0">
      <span className="block font-semibold text-dark">{title}</span>
      <span className="block text-sm text-[#4B5563]">{description}</span>
    </span>
  </label>
);

const Billing = ({
  value,
  onChange,
  sameAsShipping,
  onSameAsShippingChange,
}: BillingProps) => {
  const updateField = (field: keyof AddressForm, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-3 bg-white shadow-1 sm:mt-7.5">
      <div className="flex items-center gap-3.5 border-b border-gray-3 bg-[#F8F9FC] px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-base font-bold text-white">
          2
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-dark sm:text-xl">
            Billing details
          </h3>
          <p className="text-sm text-[#4B5563]">
            Choose how you&apos;d like to be billed.
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="flex flex-col gap-3">
          <RadioOption
            checked={sameAsShipping}
            onSelect={() => onSameAsShippingChange(true)}
            title="Same as shipping address"
            description="Use the shipping address for billing too."
          />
          <RadioOption
            checked={!sameAsShipping}
            onSelect={() => onSameAsShippingChange(false)}
            title="Use a different billing address"
            description="Enter a separate address for billing."
          />
        </div>

        {!sameAsShipping && (
          <div className="mt-6 border-t border-gray-3 pt-6">
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
        )}
      </div>
    </div>
  );
};

export default Billing;