import React from "react";

const ShippingMethod = () => {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-3 bg-white shadow-1 sm:mt-7.5">
      <div className="border-b border-gray-3 bg-[#F8F9FC] px-4 py-4 sm:px-8 sm:py-5">
        <h3 className="text-lg font-semibold text-dark sm:text-xl">
          Shipping Method
        </h3>
      </div>

      <div className="p-4 sm:p-8">
        <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-blue bg-[#EEF1FD] p-4">
          <span className="flex items-center gap-3.5">
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue bg-white"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-blue" />
            </span>
            <span className="font-semibold text-dark">Free Shipping</span>
          </span>
          <span className="text-sm font-semibold text-green">Free</span>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;