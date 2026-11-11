import React from "react";
import Image from "next/image";

const PaymentMethod = () => {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-3 bg-white shadow-1 sm:mt-7.5">
      <div className="border-b border-gray-3 bg-[#F8F9FC] px-4 py-4 sm:px-8 sm:py-5">
        <h3 className="text-lg font-semibold text-dark sm:text-xl">
          Payment Method
        </h3>
      </div>

      <div className="p-4 sm:p-8">
        <label
          htmlFor="cash"
          className="flex cursor-pointer select-none items-center gap-3.5 rounded-lg border-2 border-blue bg-[#EEF1FD] p-4"
        >
          <input
            type="radio"
            name="paymentMethod"
            id="cash"
            value="COD"
            checked
            readOnly
            className="sr-only"
          />

          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue bg-white"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-blue" />
          </span>

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-gray-3">
            <Image
              src="/images/checkout/cash.svg"
              alt="Cash on delivery"
              width={22}
              height={22}
            />
          </span>

          <span className="min-w-0">
            <span className="block font-semibold text-dark">
              Cash on delivery
            </span>
            <span className="block text-sm text-[#4B5563]">
              Pay when your order arrives.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethod;