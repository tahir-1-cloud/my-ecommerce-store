
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
  onSave: (data: CustomerAddressRequest) => Promise<void>;
  address?: CustomerAddress | null;
  isSaving?: boolean;
}

const initialForm: CustomerAddressRequest = {
  type: "Shipping",
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

const inputClass =
  "w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-2.5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  closeModal,
  onSave,
  address,
  isSaving = false,
}) => {
  const [form, setForm] = useState<CustomerAddressRequest>(initialForm);

  useEffect(() => {
    if (!isOpen) return;

    if (address) {
      setForm({
        type: address.type,
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 ?? "",
        city: address.city,
        state: address.state ?? "",
        postalCode: address.postalCode ?? "",
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, address]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeModal, isSaving]);

  if (!isOpen) return null;

  const updateField = <K extends keyof CustomerAddressRequest>(
    key: K,
    value: CustomerAddressRequest[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSave({
      ...form,
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2?.trim() || null,
      city: form.city.trim(),
      state: form.state?.trim() || null,
      postalCode: form.postalCode?.trim() || null,
      country: form.country.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-dark/70 px-4 py-5 sm:px-8 sm:py-16"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          closeModal();
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="modal-content relative w-full max-w-[900px] rounded-xl bg-white p-5 shadow-3 sm:p-7.5">
          <button
            type="button"
            onClick={closeModal}
            disabled={isSaving}
            aria-label="Close address modal"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-meta text-body hover:text-dark disabled:opacity-50"
          >
            <span className="text-2xl">&times;</span>
          </button>

          <h2 className="mb-6 pr-10 text-xl font-semibold text-dark">
            {address ? "Update Address" : "Add New Address"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-dark">
                Address Type
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  updateField("type", event.target.value as AddressType)
                }
                className={inputClass}
              >
                <option value="Shipping">Shipping Address</option>
                <option value="Billing">Billing Address</option>
              </select>
            </div>

            <div className="mb-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-dark">
                  Full Name *
                </label>
                <input
                  required
                  maxLength={200}
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={inputClass}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-dark">
                  Phone Number *
                </label>
                <input
                  required
                  maxLength={20}
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  className={inputClass}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm text-dark">
                Address Line 1 *
              </label>
              <input
                required
                maxLength={300}
                value={form.addressLine1}
                onChange={(e) => updateField("addressLine1", e.target.value)}
                className={inputClass}
                placeholder="Street address"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm text-dark">
                Address Line 2
              </label>
              <input
                maxLength={300}
                value={form.addressLine2 ?? ""}
                onChange={(e) => updateField("addressLine2", e.target.value)}
                className={inputClass}
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            <div className="mb-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-dark">
                  City *
                </label>
                <input
                  required
                  maxLength={100}
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-dark">
                  State / Province
                </label>
                <input
                  maxLength={100}
                  value={form.state ?? ""}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mb-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-dark">
                  Postal Code
                </label>
                <input
                  maxLength={20}
                  value={form.postalCode ?? ""}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-dark">
                  Country *
                </label>
                <input
                  required
                  maxLength={100}
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <label className="mb-6 flex cursor-pointer items-center gap-2 text-sm text-dark">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => updateField("isDefault", e.target.checked)}
                className="h-4 w-4"
              />
              Set as default address
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-blue px-7 py-3 font-medium text-white duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : address
                    ? "Update Address"
                    : "Save Address"}
              </button>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-md border border-gray-3 px-7 py-3 font-medium text-dark hover:bg-gray-1 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
