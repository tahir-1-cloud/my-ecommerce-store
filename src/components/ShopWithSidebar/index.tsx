
"use client";

import React, { useEffect, useMemo, useState } from "react";

import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import PriceDropdown from "./PriceDropdown";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";

import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";

import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

const PAGE_SIZE = 9;

type SortOption = "0" | "1" | "2";

const getPages = (
  current: number,
  total: number
): (number | "...")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [
      1,
      "...",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  }

  return [
    1,
    "...",
    current - 1,
    current,
    current + 1,
    "...",
    total,
  ];
};

const getProductPrice = (product: Product): number => {
  const activeVariants =
    product.variants?.filter((item) => item.isActive) ?? [];

  const variants =
    activeVariants.length > 0
      ? activeVariants
      : product.variants ?? [];

  const prices = variants
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price >= 0);

  return prices.length > 0 ? Math.min(...prices) : 0;
};

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [productSidebar, setProductSidebar] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [productError, setProductError] = useState("");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("0");

  const [page, setPage] = useState(1);

  const [selectedPrice, setSelectedPrice] = useState<{
      from: number;
      to: number;
    } | null>(null);

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  // Load products from backend
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const response = await productService.getAll();

        if (isMounted) {
          setProducts(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        console.error("Failed to load products:", error);

        if (isMounted) {
          setProductError("Unable to load products. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load categories from backend
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

  // Read category from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");

    if (!categoryParam) return;

    const categoryId = Number(categoryParam);

    if (Number.isInteger(categoryId) && categoryId > 0) {
      setSelectedCategoryIds([categoryId]);
    }
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (!productSidebar) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (
        target instanceof Element &&
        !target.closest(".sidebar-content")
      ) {
        setProductSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  const selectedCategories = categories.filter((category) =>
    selectedCategoryIds.includes(category.id)
  );

const priceBounds = useMemo(() => {
  const prices = products
    .filter((product) => product.isActive)
    .map(getProductPrice);

  const validPrices = prices.filter(
    (price) => Number.isFinite(price) && price >= 0
  );

  if (validPrices.length === 0) {
    return { min: 0, max: 100 };
  }

  return {
    min: Math.floor(Math.min(...validPrices)),
    max: Math.ceil(Math.max(...validPrices)),
  };
}, [products]);

// Initialize price range when backend prices are available.
useEffect(() => {
  setSelectedPrice({
    from: priceBounds.min,
    to: priceBounds.max,
  });
}, [priceBounds.min, priceBounds.max]);

// Initialize price range when backend prices are available.
useEffect(() => {
  setSelectedPrice({
    from: priceBounds.min,
    to: priceBounds.max,
  });
}, [priceBounds.min, priceBounds.max]);

  // Filter and sort products
const filteredProducts = useMemo(() => {
  let result = products.filter((product) => product.isActive);

  // Category filter
  if (selectedCategoryIds.length > 0) {
    result = result.filter((product) =>
      product.categoryIds?.some((categoryId) =>
        selectedCategoryIds.includes(categoryId)
      )
    );
  }

  // Price filter
  if (selectedPrice) {
    result = result.filter((product) => {
      const price = getProductPrice(product);

      return (
        price >= selectedPrice.from &&
        price <= selectedPrice.to
      );
    });
  }

  // Sorting
  if (sortOption === "0") {
    result = [...result].sort((a, b) => b.id - a.id);
  } else if (sortOption === "2") {
    result = [...result].sort((a, b) => a.id - b.id);
  }

  return result;
}, [products, selectedCategoryIds, selectedPrice, sortOption]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const from =
    filteredProducts.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const to = Math.min(
    currentPage * PAGE_SIZE,
    filteredProducts.length
  );

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset pagination when filters or sorting change
    useEffect(() => {
      setPage(1);
    }, [selectedCategoryIds, selectedPrice, sortOption]);

  return (
    <>
      <Breadcrumb
        title="Explore All Products"
        pages={["shop", "/", "shop with sidebar"]}
      />

      <section className="relative overflow-hidden bg-[#f3f4f6] pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">

            {/* Sidebar */}
            <div
              className={`sidebar-content fixed left-0 top-0 z-[9999] w-full max-w-[310px] ease-out duration-200 lg:static lg:z-0 lg:max-w-[250px] lg:translate-x-0 ${
                productSidebar
                  ? "translate-x-0 overflow-y-auto bg-white p-5"
                  : "-translate-x-full lg:translate-x-0"
              }`}
            >
              <button
                onClick={() => setProductSidebar(false)}
                aria-label="Close filters"
                type="button"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-md border border-gray-3 bg-white text-dark shadow-1 transition-colors duration-200 hover:bg-gray-1 lg:hidden"
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

              <form onSubmit={(event) => event.preventDefault()}>
                <div className="flex flex-col gap-6">

                  {/* Selected Filters */}
                  <div className="rounded-lg bg-white px-5 py-4 shadow-1">
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
                        onClick={() => {
                          setSelectedCategoryIds([]);
                          setSelectedPrice({
                            from: priceBounds.min,
                            to: priceBounds.max,
                          });
                        }}
                        disabled={
                          selectedCategoryIds.length === 0 &&
                          selectedPrice?.from === priceBounds.min &&
                          selectedPrice?.to === priceBounds.max
                        }
                        className="text-sm text-blue transition-colors hover:text-blue-dark disabled:cursor-not-allowed disabled:text-gray-4"
                      >
                        Clean All
                      </button>
                    </div>

                    {selectedCategories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-3 pt-3">
                        {selectedCategories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-blue/10 py-1 pl-3 pr-1.5 text-xs font-medium text-blue"
                          >
                            {category.name}

                            <button
                              type="button"
                              aria-label={`Remove ${category.name}`}
                              onClick={() =>
                                setSelectedCategoryIds((ids) =>
                                  ids.filter((id) => id !== category.id)
                                )
                              }
                              className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-blue hover:text-white"
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 12 12"
                                fill="none"
                                aria-hidden="true"
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
                    <div className="space-y-3 rounded-lg bg-white px-5 py-4 shadow-1">
                      <div className="h-5 w-24 animate-pulse rounded bg-gray-2" />

                      {[0, 1, 2, 3].map((index) => (
                        <div key={index} className="flex items-center gap-3">
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
                  <PriceDropdown 
                    minPrice={priceBounds.min}
                    maxPrice={priceBounds.max}
                    value={
                      selectedPrice ?? {
                        from: priceBounds.min,
                        to: priceBounds.max,
                      }
                    }
                    onChange={setSelectedPrice}
                  />
                </div>
              </form>
            </div>

            {/* Products Content */}
            <div className="w-full lg:max-w-[870px]">

              {/* Toolbar */}
              <div className="mb-6 rounded-lg bg-white py-2.5 pl-3 pr-2.5 shadow-1">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">

                    <button
                      onClick={() => setProductSidebar(true)}
                      aria-label="Open filters"
                      aria-expanded={productSidebar}
                      type="button"
                      className="inline-flex h-11 items-center gap-2 rounded-md border border-blue bg-blue px-4 text-sm font-medium text-white shadow-1 transition-colors duration-200 hover:bg-blue-dark lg:hidden"
                    >
                      Filters

                      {selectedCategoryIds.length > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-medium text-blue">
                          {selectedCategoryIds.length}
                        </span>
                      )}
                    </button>

                    <CustomSelect
                      options={options}
                      value={sortOption}
                      onChange={(value: SortOption) => setSortOption(value)}
                    />

                    <p className="text-sm">
                      Showing{" "}
                      <span className="text-dark">
                        {from}-{to} of {filteredProducts.length}
                      </span>{" "}
                      Products
                    </p>
                  </div>

                  {/* Grid / List Toggle */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="Show grid view"
                      type="button"
                      className={`flex h-9 w-10.5 items-center justify-center rounded-[5px] border transition-colors duration-200 hover:border-blue hover:bg-blue hover:text-white ${
                        productStyle === "grid"
                          ? "border-blue bg-blue text-white"
                          : "border-gray-3 bg-gray-1 text-dark"
                      }`}
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
                      aria-label="Show list view"
                      type="button"
                      className={`flex h-9 w-10.5 items-center justify-center rounded-[5px] border transition-colors duration-200 hover:border-blue hover:bg-blue hover:text-white ${
                        productStyle === "list"
                          ? "border-blue bg-blue text-white"
                          : "border-gray-3 bg-gray-1 text-dark"
                      }`}
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

              {/* Product Loading */}
              {loadingProducts ? (
                <div
                  className={
                    productStyle === "grid"
                      ? "grid grid-cols-1 gap-x-7.5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
                      : "flex flex-col gap-7.5"
                  }
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index}>
                      <div className="mb-4 h-[270px] animate-pulse rounded-lg bg-gray-2" />
                      <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-gray-2" />
                      <div className="h-4 w-1/3 animate-pulse rounded bg-gray-2" />
                    </div>
                  ))}
                </div>
              ) : productError ? (
                <div className="rounded-lg bg-white p-10 text-center shadow-1">
                  <p className="text-red">{productError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-md bg-blue px-5 py-2 text-white hover:bg-blue-dark"
                  >
                    Try Again
                  </button>
                </div>
              ) : pagedProducts.length === 0 ? (
                <div className="rounded-lg bg-white p-10 text-center shadow-1">
                  <p className="font-medium text-dark">No products found</p>
                  <p className="mt-1 text-sm text-dark-4">
                    Try changing or clearing your filters.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    productStyle === "grid"
                      ? "grid grid-cols-1 gap-x-7.5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
                      : "flex flex-col gap-7.5"
                  }
                >
                  {pagedProducts.map((item) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item} key={item.id} />
                    ) : (
                      <SingleListItem item={item} key={item.id} />
                    )
                  )}
                </div>
              )}

              {/* Pagination */}
              {!loadingProducts && !productError && totalPages > 1 && (
                <div className="mt-15 flex justify-center">
                  <div className="rounded-md bg-white p-2 shadow-1">
                    <ul className="flex items-center">
                      <li>
                        <button
                          type="button"
                          aria-label="Previous page"
                          disabled={currentPage === 1}
                          onClick={() => goToPage(currentPage - 1)}
                          className="flex h-9 w-8 items-center justify-center rounded-[3px] transition-colors duration-200 hover:bg-blue hover:text-white disabled:text-gray-4 disabled:hover:bg-transparent"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                            <path d="M11 3L5 9L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </li>

                      {getPages(currentPage, totalPages).map((pageNumber, index) => (
                        <li key={`${pageNumber}-${index}`}>
                          {pageNumber === "..." ? (
                            <span className="flex px-3.5 py-1.5">...</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => goToPage(pageNumber)}
                              aria-current={
                                pageNumber === currentPage ? "page" : undefined
                              }
                              className={`flex rounded-[3px] px-3.5 py-1.5 transition-colors duration-200 ${
                                pageNumber === currentPage
                                  ? "bg-blue text-white"
                                  : "hover:bg-blue hover:text-white"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          )}
                        </li>
                      ))}

                      <li>
                        <button
                          type="button"
                          aria-label="Next page"
                          disabled={currentPage === totalPages}
                          onClick={() => goToPage(currentPage + 1)}
                          className="flex h-9 w-8 items-center justify-center rounded-[3px] transition-colors duration-200 hover:bg-blue hover:text-white disabled:text-gray-4 disabled:hover:bg-transparent"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                            <path d="M7 3L13 9L7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;