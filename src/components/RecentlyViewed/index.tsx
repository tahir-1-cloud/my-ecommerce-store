"use client";

import Image from "next/image";
import Link from "next/link";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  removeRecentlyViewed,
  clearRecentlyViewed,
} from "@/redux/features/recently-viewed-slice";
import { useAddToCart } from "@/hooks/useAddToCart";

export const RecentlyViewed = () => {
  const dispatch = useAppDispatch();
  const { handleAddToCart, isInCart } = useAddToCart();

  const items = useAppSelector((state) => state.recentlyViewedReducer.items);

  return (
    <>
      <Breadcrumb title={"Recently Viewed"} pages={["recently viewed"]} />

      <section className="overflow-hidden bg-gray-2 py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center rounded-lg bg-white px-6 py-16 text-center shadow-1">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-2 text-dark-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M12 7v5l3 2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2 className="mb-1.5 text-xl font-semibold text-dark">
                No recently viewed products
              </h2>
              <p className="mb-6 text-custom-sm text-dark-4">
                You haven&apos;t viewed any products yet.
              </p>
              <Link
                href="/shop-with-sidebar"
                className="inline-flex rounded-md bg-blue px-6 py-2.5 text-custom-sm font-medium text-white duration-200 ease-out hover:bg-blue-dark"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-3 text-xl font-semibold text-dark xl:text-heading-5">
                  Recently Viewed
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue/10 px-2 text-custom-sm font-medium text-blue">
                    {items.length}
                  </span>
                </h2>

                <button
                  type="button"
                  onClick={() => dispatch(clearRecentlyViewed())}
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-gray-3 bg-white px-4 py-2 text-custom-sm font-medium text-dark shadow-1 duration-200 ease-out hover:border-red hover:text-red"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Clear All
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-x-7.5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => {
                  const image =
                    item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0];
                  const added = isInCart(item.id);
                  const detailsHref = `/shop-details?id=${item.id}`;
                  const hasDiscount =
                    item.price != null &&
                    item.discountedPrice != null &&
                    item.price > item.discountedPrice;

                  return (
                    <div key={item.id} className="group">
                      {/* Image + overlay actions */}
                      <div className="relative mb-4 overflow-hidden rounded-lg bg-white shadow-1">
                        <Link
                          href={detailsHref}
                          aria-label={`View ${item.title}`}
                          className="relative block h-[260px] w-full"
                        >
                          {image ? (
                            <Image
                              src={image}
                              alt={item.title}
                              fill
                              sizes="(min-width: 1280px) 270px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                              unoptimized
                              className="object-contain p-5 duration-300 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-sm text-gray-4">
                              No image available
                            </span>
                          )}
                        </Link>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => dispatch(removeRecentlyViewed(item.id))}
                          aria-label={`Remove ${item.title} from recently viewed`}
                          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-dark-4 shadow-1 duration-200 ease-out hover:bg-red hover:text-white"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path
                              d="M3 3L9 9M9 3L3 9"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>

                        {/* Add to cart: mobile par hamesha, desktop par hover par slide-up */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-4 duration-200 ease-out lg:translate-y-full lg:group-hover:translate-y-0">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            disabled={added}
                            className={`pointer-events-auto inline-flex h-11 w-full max-w-[220px] items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap shadow-1 duration-200 ease-out ${
                              added
                                ? "cursor-default bg-[#16a34a] text-white"
                                : "bg-blue text-white hover:bg-blue-dark"
                            }`}
                          >
                            {!added && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M3 4h2l2.2 10.2a1.5 1.5 0 001.5 1.2h8.1a1.5 1.5 0 001.5-1.1L20 8H6.2"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle cx="9" cy="19.5" r="1.3" fill="currentColor" />
                                <circle cx="17" cy="19.5" r="1.3" fill="currentColor" />
                              </svg>
                            )}
                            {added ? "✓ Added to Cart" : "Add to Cart"}
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="mb-1.5 line-clamp-2 font-medium text-dark duration-200 ease-out hover:text-blue">
                        <Link href={detailsHref}>{item.title}</Link>
                      </h3>

                      <span className="flex items-center gap-2 text-lg font-medium">
                        <span className="text-dark">${item.discountedPrice}</span>
                        {hasDiscount && (
                          <span className="text-dark-4 line-through">
                            ${item.price}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default RecentlyViewed;