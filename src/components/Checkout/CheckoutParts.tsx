"use client";

import React from "react";
import type { CustomerAddress } from "@/types/customer";
import type { AddressForm } from "./Billing";

export type SavedSelection = number | "new" | null;

export const inputClass =
  "h-12 w-full rounded-lg border border-[#CBD2E0] bg-white px-4 text-base text-dark outline-none duration-200 placeholder:text-[#8A94A6] hover:border-[#9AA5BC] focus:border-blue focus:ring-4 focus:ring-[#DDE3FB] read-only:cursor-not-allowed read-only:bg-[#F3F4F8] read-only:text-[#4B5563]";

export const labelClass = "mb-2 block text-sm font-semibold text-dark";

export const Req = () => <span className="ml-0.5 text-red">*</span>;

export const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue px-6 text-sm font-semibold text-white duration-200 ease-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60";

export const btnOutline =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#CBD2E0] bg-white px-6 text-sm font-semibold text-dark duration-200 ease-out hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-60";

export function StepCard({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-3 bg-white shadow-1 first:mt-0 sm:mt-7.5">
      <div className="flex items-center gap-3.5 border-b border-gray-3 bg-[#F8F9FC] px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-base font-bold text-white">
          {step}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-dark sm:text-xl">
            {title}
          </h3>
          {subtitle && <p className="text-sm text-[#4B5563]">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-8">{children}</div>
    </div>
  );
}

export function RadioCard({
  name,
  checked,
  onSelect,
  children,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3.5 rounded-lg border-2 p-4 duration-200 ease-out ${
        checked
          ? "border-blue bg-[#EEF1FD]"
          : "border-gray-3 bg-white hover:border-[#9AA5BC]"
      }`}
    >
      <input
        type="radio"
        name={name}
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
      <div className="min-w-0 flex-1">{children}</div>
    </label>
  );
}

const addressLine = (a: CustomerAddress) =>
  [
    a.addressLine1,
    a.addressLine2,
    a.city,
    [a.state, a.postalCode].filter(Boolean).join(" "),
    a.country,
  ]
    .filter(Boolean)
    .join(", ");

export function SavedAddressList({
  name,
  addresses,
  selected,
  onSelect,
  onEdit,
  allowNew = true,
  newLabel = "Use a new address",
}: {
  name: string;
  addresses: CustomerAddress[];
  selected: SavedSelection;
  onSelect: (selection: number | "new") => void;
  onEdit?: (address: CustomerAddress) => void;
  // false: sirf saved addresses (naya add nahi)
  allowNew?: boolean;
  newLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {addresses.map((address) => (
        <RadioCard
          key={address.id}
          name={name}
          checked={selected === address.id}
          onSelect={() => onSelect(address.id)}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-0.5">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-dark">
                {address.fullName}
                {address.isDefault && (
                  <span className="rounded-full bg-blue px-2.5 py-0.5 text-xs font-semibold text-white">
                    Default
                  </span>
                )}
              </p>
              <p className="text-sm text-[#374151]">{address.phoneNumber}</p>
              <p className="text-sm leading-6 text-[#4B5563]">
                {addressLine(address)}
              </p>
            </div>

            {onEdit && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onEdit(address);
                }}
                className="inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-md border border-[#CBD2E0] bg-white px-3.5 text-sm font-semibold text-dark duration-200 hover:border-blue hover:text-blue"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                </svg>
                Edit
              </button>
            )}
          </div>
        </RadioCard>
      ))}

      {allowNew && (
        <RadioCard
          name={name}
          checked={selected === "new"}
          onSelect={() => onSelect("new")}
        >
          <span className="flex items-center gap-2 font-semibold text-dark">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-blue"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {newLabel}
          </span>
        </RadioCard>
      )}
    </div>
  );
}

// Logged-in user ke edit/add ke liye: sirf address fields
// (naam, email, phone profile se aate hain)
export function AddressEditFields({
  idPrefix = "addr",
  value,
  onChange,
}: {
  idPrefix?: string;
  value: AddressForm;
  onChange: (value: AddressForm) => void;
}) {
  const set =
    (field: keyof AddressForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [field]: event.target.value });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={`${idPrefix}-country`} className={labelClass}>
          Country / Region <Req />
        </label>
        <input
          id={`${idPrefix}-country`}
          autoComplete="country-name"
          value={value.country}
          onChange={set("country")}
          placeholder="Pakistan"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-line1`} className={labelClass}>
          Street Address <Req />
        </label>
        <input
          id={`${idPrefix}-line1`}
          autoComplete="address-line1"
          value={value.addressLine1}
          onChange={set("addressLine1")}
          placeholder="House number and street name"
          className={inputClass}
        />
        <input
          aria-label="Address line 2"
          autoComplete="address-line2"
          value={value.addressLine2}
          onChange={set("addressLine2")}
          placeholder="Apartment, suite, unit, etc. (optional)"
          className={`${inputClass} mt-3`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor={`${idPrefix}-city`} className={labelClass}>
            Town / City <Req />
          </label>
          <input
            id={`${idPrefix}-city`}
            autoComplete="address-level2"
            value={value.city}
            onChange={set("city")}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-state`} className={labelClass}>
            State / Province
          </label>
          <input
            id={`${idPrefix}-state`}
            autoComplete="address-level1"
            value={value.state}
            onChange={set("state")}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-postal`} className={labelClass}>
            Postal Code
          </label>
          <input
            id={`${idPrefix}-postal`}
            autoComplete="postal-code"
            value={value.postalCode}
            onChange={set("postalCode")}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}