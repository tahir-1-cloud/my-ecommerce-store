
"use client";

import React, { useEffect, useMemo, useState } from "react";

import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";

import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import { toStoreItem } from "@/lib/helper/productHelpers";

type ProductWithDate = Product & {
  createdAt?: string;
  totalSold?: number;
};

const PAGE_SIZE = 12;

const ShopWithoutSidebar = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await productService.getAll();

        const activeProducts = response.filter(
          (product) => product.isActive === true
        );

        if (isMounted) {
          setProducts(activeProducts);
        }
      } catch (err) {
        console.error("Failed to fetch shop products:", err);

        if (isMounted) {
          setProducts([]);
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedProducts = useMemo(() => {
    const result = [...(products as ProductWithDate[])];

    result.sort((a, b) => {
      if (sortBy === "1") {
        // Requires totalSold to be returned by the backend.
        return (b.totalSold ?? 0) - (a.totalSold ?? 0);
      }

      if (sortBy === "2") {
        // Oldest products first.
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dateA - dateB || a.id - b.id;
      }

      // Latest products first.
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA || b.id - a.id;
    });

    return result;
  }, [products, sortBy]);

  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <Breadcrumb
        title="Explore All Products"
        pages={["shop", "/", "shop without sidebar"]}
      />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            <div className="w-full">

              {/* Shop Toolbar */}
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">

                  {/* Toolbar Left */}
                  <div className="flex flex-wrap items-center gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="h-10 rounded-md border border-gray-3 bg-gray-1 px-3 text-sm text-dark outline-none focus:border-blue"
                      aria-label="Sort products"
                    >
                      <option value="0">Latest Products</option>
                      <option value="1">Best Selling</option>
                      <option value="2">Old Products</option>
                    </select>

                    <p className="text-sm">
                      Showing{" "}
                      <span className="text-dark font-medium">
                        {totalProducts === 0
                          ? 0
                          : startIndex + 1}{" "}
                        - {Math.min(startIndex + PAGE_SIZE, totalProducts)} of{" "}
                        {totalProducts}
                      </span>{" "}
                      Products
                    </p>
                  </div>

                  {/* Toolbar Right */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setProductStyle("grid")}
                      aria-label="Grid view"
                      aria-pressed={productStyle === "grid"}
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
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current"
                      >
                        <rect x="1" y="1" width="7" height="7" rx="1" />
                        <rect x="10" y="1" width="7" height="7" rx="1" />
                        <rect x="1" y="10" width="7" height="7" rx="1" />
                        <rect x="10" y="10" width="7" height="7" rx="1" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductStyle("list")}
                      aria-label="List view"
                      aria-pressed={productStyle === "list"}
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
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current"
                      >
                        <rect x="1" y="1" width="16" height="6" rx="1" />
                        <rect x="1" y="10" width="16" height="6" rx="1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {loading ? (
                <div
                  className={
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }
                >
                  {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[320px] rounded-lg bg-white animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-lg bg-white p-10 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="rounded-lg bg-white p-10 text-center">
                  <h3 className="text-lg font-medium text-dark">
                    No Products Found
                  </h3>
                  <p className="mt-2 text-sm">
                    There are currently no active products available.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }
                >
                  {paginatedProducts.map((product) => {
                    const item = toStoreItem(product);

                    return productStyle === "grid" ? (
                      <SingleGridItem
                        item={item}
                        key={product.id}
                      />
                    ) : (
                      <SingleListItem
                        item={item}
                        key={product.id}
                      />
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
                <div className="flex justify-center mt-15">
                  <div className="bg-white shadow-1 rounded-md p-2">
                    <ul className="flex items-center gap-1">
                      <li>
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() =>
                            handlePageChange(currentPage - 1)
                          }
                          aria-label="Previous page"
                          className="flex items-center justify-center w-8 h-9 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M11.5 3L5.5 9L11.5 15"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </li>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <li key={page}>
                          <button
                            type="button"
                            onClick={() => handlePageChange(page)}
                            aria-current={
                              currentPage === page ? "page" : undefined
                            }
                            className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${
                              currentPage === page
                                ? "bg-blue text-white"
                                : "hover:text-white hover:bg-blue"
                            }`}
                          >
                            {page}
                          </button>
                        </li>
                      ))}

                      <li>
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            handlePageChange(currentPage + 1)
                          }
                          aria-label="Next page"
                          className="flex items-center justify-center w-8 h-9 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M6.5 3L12.5 9L6.5 15"
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
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithoutSidebar;
