"use client";

import React, { useEffect, useState } from "react";
import type {
  AddressType,
  CustomerAddress,
  CustomerAddressRequest,
} from "@/types/customer";

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  // Create par 1 ya 2 requests (shipping + billing), edit par sirf 1
  onSave: (data: CustomerAddressRequest[]) => Promise<void>;
  address?: CustomerAddress | null;
  isSaving?: boolean;
  // Jin types ka address abhi saved nahi hai
  missingTypes: AddressType[];
  shippingAddress?: CustomerAddress | null;
}

const emptyForm: CustomerAddressRequest = {
  type: "Shipping" as AddressType,
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: true,
};

const inputClass =
  "h-12 w-full rounded-lg border border-[#CBD2E0] bg-white px-4 text-base text-dark outline-none duration-200 placeholder:text-[#8A94A6] hover:border-[#9AA5BC] focus:border-blue focus:ring-4 focus:ring-[#DDE3FB]";

const labelClass = "mb-2 block text-sm font-semibold text-dark";

const Req = () => <span className="ml-0.5 text-red">*</span>;

const toForm = (a: CustomerAddress): CustomerAddressRequest => ({
  type: a.type,
  fullName: a.fullName,
  phoneNumber: a.phoneNumber,
  addressLine1: a.addressLine1,
  addressLine2: a.addressLine2 ?? "",
  city: a.city,
  state: a.state ?? "",
  postalCode: a.postalCode ?? "",
  country: a.country,
  isDefault: a.isDefault,
});

const build = (
  f: CustomerAddressRequest,
  type: AddressType,
  isDefault: boolean
): CustomerAddressRequest => ({
  ...f,
  type,
  isDefault,
  fullName: f.fullName.trim(),
  phoneNumber: f.phoneNumber.trim(),
  addressLine1: f.addressLine1.trim(),
  addressLine2: f.addressLine2?.trim() || null,
  city: f.city.trim(),
  state: f.state?.trim() || null,
  postalCode: f.postalCode?.trim() || null,
  country: f.country.trim(),
});

function AddressFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: CustomerAddressRequest;
  onChange: (value: CustomerAddressRequest) => void;
}) {
  const set =
    (key: keyof CustomerAddressRequest) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: event.target.value });

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={labelClass}>
            Full Name <Req />
          </label>
          <input
            id={`${idPrefix}-name`}
            required
            maxLength={200}
            autoComplete="name"
            value={value.fullName}
            onChange={set("fullName")}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-phone`} className={labelClass}>
            Phone Number <Req />
          </label>
          <input
            id={`${idPrefix}-phone`}
            required
            type="tel"
            maxLength={20}
            autoComplete="tel"
            value={value.phoneNumber}
            onChange={set("phoneNumber")}
            placeholder="03XX XXXXXXX"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-address1`} className={labelClass}>
          Street Address <Req />
        </label>
        <input
          id={`${idPrefix}-address1`}
          required
          maxLength={300}
          autoComplete="address-line1"
          value={value.addressLine1}
          onChange={set("addressLine1")}
          placeholder="House number and street name"
          className={inputClass}
        />
        <input
          aria-label="Address line 2"
          maxLength={300}
          autoComplete="address-line2"
          value={value.addressLine2 ?? ""}
          onChange={set("addressLine2")}
          placeholder="Apartment, suite, unit, etc. (optional)"
          className={`${inputClass} mt-3`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-city`} className={labelClass}>
            City <Req />
          </label>
          <input
            id={`${idPrefix}-city`}
            required
            maxLength={100}
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
            maxLength={100}
            autoComplete="address-level1"
            value={value.state ?? ""}
            onChange={set("state")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-postal`} className={labelClass}>
            Postal Code
          </label>
          <input
            id={`${idPrefix}-postal`}
            maxLength={20}
            autoComplete="postal-code"
            value={value.postalCode ?? ""}
            onChange={set("postalCode")}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-country`} className={labelClass}>
            Country <Req />
          </label>
          <input
            id={`${idPrefix}-country`}
            required
            maxLength={100}
            autoComplete="country-name"
            value={value.country}
            onChange={set("country")}
            placeholder="Pakistan"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

function RadioOption({
  checked,
  onSelect,
  title,
  description,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
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
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  closeModal,
  onSave,
  address,
  isSaving = false,
  missingTypes,
  shippingAddress,
}) => {
  const [form, setForm] = useState<CustomerAddressRequest>(emptyForm);
  const [billingForm, setBillingForm] =
    useState<CustomerAddressRequest>(emptyForm);
  const [billingSame, setBillingSame] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setForm(address ? toForm(address) : emptyForm);
    setBillingForm(emptyForm);
    setBillingSame(true);
  }, [isOpen, address]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        closeModal();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeModal, isSaving]);

  if (!isOpen) return null;

  const editing = !!address;
  const both = !editing && missingTypes.length >= 2;
  const singleType: AddressType = editing
    ? address!.type
    : (missingTypes[0] ?? ("Shipping" as AddressType));

  const typeLabel = String(singleType).toLowerCase();

  const title = editing
    ? `Update ${typeLabel} address`
    : both
      ? "Add your address"
      : `Add ${typeLabel} address`;

  const description = editing
    ? "Make changes and save your address."
    : both
      ? "Enter your address once. Use the same for billing, or add a different one."
      : "Enter the details below.";

  const canCopyShipping =
    !editing &&
    !both &&
    norm(String(singleType)) === "billing" &&
    !!shippingAddress;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      await onSave([build(form, address!.type, address!.isDefault)]);
      return;
    }

    if (both) {
      const ship = build(form, "Shipping" as AddressType, true);
      const bill = billingSame
        ? { ...ship, type: "Billing" as AddressType }
        : build(billingForm, "Billing" as AddressType, true);

      await onSave([ship, bill]);
      return;
    }

    await onSave([build(form, singleType, true)]);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-dark/60 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[94vh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-2xl bg-white shadow-3 sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-3 bg-[#F8F9FC] px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-dark sm:text-xl">
              {title}
            </h2>
            <p className="text-sm text-[#4B5563]">{description}</p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSaving}
            aria-label="Close address modal"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-3 bg-white text-dark duration-200 hover:bg-dark hover:text-white disabled:opacity-50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-7 overflow-y-auto p-5 sm:p-7">
            {/* Main form */}
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-dark">
                  {both || editing || singleType === "Shipping"
                    ? both
                      ? "Shipping address"
                      : `${singleType} address`
                    : `${singleType} address`}
                </h3>

                {canCopyShipping && shippingAddress && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...toForm(shippingAddress),
                        type: singleType,
                        isDefault: true,
                      })
                    }
                    className="text-sm font-semibold text-blue hover:underline"
                  >
                    Use my shipping address
                  </button>
                )}
              </div>

              <AddressFields
                idPrefix="main"
                value={form}
                onChange={setForm}
              />
            </div>

            {/* Billing choice (sirf jab dono add ho rahe hon) */}
            {both && (
              <div>
                <h3 className="mb-3 font-semibold text-dark">
                  Billing address
                </h3>

                <div className="flex flex-col gap-3">
                  <RadioOption
                    checked={billingSame}
                    onSelect={() => setBillingSame(true)}
                    title="Same as shipping address"
                    description="Use the shipping address for billing too."
                  />
                  <RadioOption
                    checked={!billingSame}
                    onSelect={() => setBillingSame(false)}
                    title="Use a different billing address"
                    description="Enter a separate address for billing."
                  />
                </div>

                {!billingSame && (
                  <div className="mt-6 border-t border-gray-3 pt-6">
                    <AddressFields
                      idPrefix="billing"
                      value={billingForm}
                      onChange={setBillingForm}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-3 bg-[#F8F9FC] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#CBD2E0] bg-white px-7 font-semibold text-dark duration-200 hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-blue px-7 font-semibold text-white duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : editing
                  ? "Update Address"
                  : both
                    ? "Save Addresses"
                    : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;

function norm(arg0: string) {
  return arg0.trim().toLowerCase();
}
