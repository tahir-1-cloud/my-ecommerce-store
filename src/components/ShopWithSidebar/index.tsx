"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import PriceDropdown from "./PriceDropdown";
import shopData from "../Shop/shopData";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { Category } from "@/types/category";
import { categoryService } from "@/services/categoryService";

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll();

        if (isMounted && Array.isArray(response)) {
          setCategories(response);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Home ke Categories se /shop-with-sidebar?category=3 khulne par pehle se select
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("category");
    const id = param ? Number(param) : NaN;

    if (!Number.isNaN(id)) setSelectedCategoryIds([id]);
  }, []);

  const selectedCategories = categories.filter((c) =>
    selectedCategoryIds.includes(c.id)
  );

  return (
    <>
      <Breadcrumb
        title={"Explore All Products"}
        pages={["shop", "/", "shop with sidebar"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed lg:z-1 z-9999 left-0 top-0 lg:translate-x-0 lg:static max-w-[310px] lg:max-w-[250px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(false)}
                aria-label="Close filters"
                type="button"
                className="lg:hidden absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-md border border-gray-3 bg-white text-dark shadow-1 transition-colors duration-200 hover:bg-gray-1"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  {/* Filter box */}
                  <div className="bg-white shadow-1 rounded-lg px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <svg
                          className="text-blue"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 6H20M7 12H17M10 18H14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                        <p className="font-medium text-dark">Filters</p>
                        {selectedCategoryIds.length > 0 && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1.5 text-xs font-medium text-white">
                            {selectedCategoryIds.length}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCategoryIds([])}
                        disabled={selectedCategoryIds.length === 0}
                        className="text-sm text-blue transition-colors hover:text-blue-dark disabled:cursor-not-allowed disabled:text-gray-4"
                      >
                        Clean All
                      </button>
                    </div>

                    {/* Selected category chips */}
                    {selectedCategories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-3 pt-3">
                        {selectedCategories.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-blue/10 py-1 pl-3 pr-1.5 text-xs font-medium text-blue"
                          >
                            {c.name}
                            <button
                              type="button"
                              aria-label={`Remove ${c.name}`}
                              onClick={() =>
                                setSelectedCategoryIds((ids) =>
                                  ids.filter((id) => id !== c.id)
                                )
                              }
                              className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-blue hover:text-white"
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M3 3L9 9M9 3L3 9"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Filter */}
                  {loadingCategories ? (
                    <div className="bg-white shadow-1 rounded-lg px-5 py-4 space-y-3">
                      <div className="h-5 w-24 animate-pulse rounded bg-gray-2" />
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-9 w-9 animate-pulse rounded-full bg-gray-2" />
                          <div className="h-4 flex-1 animate-pulse rounded bg-gray-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <CategoryDropdown
                      categories={categories}
                      selectedIds={selectedCategoryIds}
                      onChange={setSelectedCategoryIds}
                    />
                  )}

                  {/* Price Filter */}
                  <PriceDropdown />
                </div>
              </form>
            </div>
            {/* // <!-- Sidebar End --> */}

            {/* // <!-- Content Start --> */}
            <div className="lg:max-w-[870px] w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* <!-- top bar left --> */}
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setProductSidebar(true)}
                      aria-label="Open filters"
                      aria-expanded={productSidebar}
                      type="button"
                      className="lg:hidden inline-flex h-11 items-center gap-2 rounded-md border border-blue bg-blue px-4 text-sm font-medium text-white shadow-1 transition-colors duration-200 hover:bg-blue-dark"
                    >
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 6H20M7 12H17M10 18H14"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      Filters
                      {selectedCategoryIds.length > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-medium text-blue">
                          {selectedCategoryIds.length}
                        </span>
                      )}
                    </button>
                    <CustomSelect options={options} />

                    <p>
                      Showing <span className="text-dark">9 of 50</span>{" "}
                      Products
                    </p>
                  </div>

                  {/* <!-- top bar right --> */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="button for product grid tab"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect x="1.9" y="1.9" width="5.7" height="5.7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="10.4" y="1.9" width="5.7" height="5.7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="1.9" y="10.4" width="5.7" height="5.7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="10.4" y="10.4" width="5.7" height="5.7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="button for product list tab"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect x="1.5" y="1.9" width="15" height="5.7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="1.5" y="10.4" width="15" height="5.7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* <!-- Products Grid Tab Content Start --> */}
              <div
                className={`${
                  productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                }`}
              >
                {shopData.map((item, key) =>
                  productStyle === "grid" ? (
                    <SingleGridItem item={item} key={key} />
                  ) : (
                    <SingleListItem item={item} key={key} />
                  )
                )}
              </div>
              {/* <!-- Products Grid Tab Content End --> */}

              {/* <!-- Products Pagination Start --> */}
              <div className="flex justify-center mt-15">
                <div className="bg-white shadow-1 rounded-md p-2">
                  <ul className="flex items-center">
                    <li>
                      <button
                        aria-label="Previous page"
                        type="button"
                        disabled
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M11 3L5 9L11 15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </li>

                    <li>
                      <a
                        href="#"
                        className="flex py-1.5 px-3.5 duration-200 rounded-[3px] bg-blue text-white hover:text-white hover:bg-blue"
                      >
                        1
                      </a>
                    </li>

                    {[2, 3, 4, 5, "...", 10].map((page) => (
                      <li key={page}>
                        <a
                          href="#"
                          className="flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue"
                        >
                          {page}
                        </a>
                      </li>
                    ))}

                    <li>
                      <button
                        aria-label="Next page"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 3L13 9L7 15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              {/* <!-- Products Pagination End --> */}
            </div>
            {/* // <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;