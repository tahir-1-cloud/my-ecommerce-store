
"use client";

import { useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

interface PriceDropdownProps {
  minPrice: number;
  maxPrice: number;
  value: {
    from: number;
    to: number;
  };
  onChange: (value: { from: number; to: number }) => void;
}

const PriceDropdown = ({
  minPrice,
  maxPrice,
  value,
  onChange,
}: PriceDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  const safeMin = Number.isFinite(minPrice) ? minPrice : 0;

  const actualMax = Number.isFinite(maxPrice)
    ? Math.max(maxPrice, safeMin)
    : 100;

  // RangeSlider requires max > min.
  const safeMax = actualMax > safeMin ? actualMax : safeMin + 1;

  // Keep selected values within the available price range.
  const safeFrom = Math.min(
    safeMax,
    Math.max(safeMin, value?.from ?? safeMin)
  );

  const safeTo = Math.max(
    safeFrom,
    Math.min(safeMax, value?.to ?? actualMax)
  );

  return (
    <div className="rounded-lg bg-white shadow-1">
      <div
        onClick={() => setToggleDropdown((prev) => !prev)}
        className="flex cursor-pointer items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-dark">Price</p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setToggleDropdown((prev) => !prev);
          }}
          id="price-dropdown-btn"
          aria-label="Toggle price dropdown"
          aria-expanded={toggleDropdown}
          className={`text-dark transition-transform duration-200 ${
            toggleDropdown ? "rotate-180" : ""
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className={`p-6 ${toggleDropdown ? "block" : "hidden"}`}>
        <div id="pricingOne">
          <div className="price-range">
            <RangeSlider
              id="range-slider-gradient"
              className="margin-lg"
              min={safeMin}
              max={safeMax}
              step={1}
              value={[safeFrom, safeTo]}
              onInput={(range) => {
                onChange({
                  from: Math.max(
                    safeMin,
                    Math.floor(range[0])
                  ),
                  to: Math.min(
                    actualMax,
                    Math.ceil(range[1])
                  ),
                });
              }}
            />

            <div className="price-amount flex items-center justify-between pt-4">
              <div className="flex rounded border border-gray-3/80 text-custom-xs text-dark-4">
                <span className="block border-r border-gray-3/80 px-2.5 py-1.5">
                  $
                </span>
                <span className="block px-3 py-1.5">
                  {safeFrom}
                </span>
              </div>

              <div className="flex rounded border border-gray-3/80 text-custom-xs text-dark-4">
                <span className="block border-r border-gray-3/80 px-2.5 py-1.5">
                  $
                </span>
                <span className="block px-3 py-1.5">
                  {safeTo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
