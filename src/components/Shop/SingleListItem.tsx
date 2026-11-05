
"use client";

import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { toggleWishlistItem } from "@/redux/features/wishlist-slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";

import {
  formatPrice,
  getPriceInfo,
  getProductImage,
  isInStock,
  toStoreItem,
} from "@/lib/helper/productHelpers";
import { useAddToCart } from "@/hooks/useAddToCart";

const SingleListItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useAppDispatch();

  const image = getProductImage(item);
  const { price, oldPrice } = getPriceInfo(item);
  const inStock = isInStock(item);
  const detailsHref = `/shop-details?id=${item.id}`;

  const isWishlisted = useAppSelector((state) =>
    state.wishlistReducer.items.some(
      (wishItem) => wishItem.id === item.id
    )
  );

  const handleQuickView = () => {
    dispatch(updateQuickView(toStoreItem(item) as any));
    openModal();
  };


const { handleAddToCart, isInCart } = useAddToCart();

const added = isInCart(item.id);

  const handleToggleWishlist = () => {
    dispatch(
      toggleWishlistItem({
        ...toStoreItem(item),
        status: inStock ? "available" : "out-of-stock",
        quantity: 1,
      } as any)
    );
  };

  return (
    <div className="group rounded-lg bg-white shadow-1">
      <div className="flex">
        <div className="shadow-list relative flex w-full max-w-[270px] items-center justify-center overflow-hidden p-4 sm:min-h-[270px]">
          {image ? (
            <Image
              src={image}
              alt={item.name}
              width={250}
              height={250}
              className="h-[250px] w-full object-contain"
            />
          ) : (
            <div className="flex h-[250px] w-full items-center justify-center text-sm text-gray-4">
              No image available
            </div>
          )}

          {!inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-red px-3 py-1 text-xs font-medium text-white">
              Out of stock
            </span>
          )}

          <div className="absolute bottom-0 left-0 flex w-full translate-y-full items-center justify-center gap-2.5 pb-5 duration-200 ease-linear group-hover:translate-y-0">
            {/* Quick View */}
            <button
              type="button"
              onClick={handleQuickView}
              aria-label="Quick view"
              className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-white text-dark shadow-1 duration-200 ease-out hover:text-blue"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1.8 8C3 6 5.1 3.3 8 3.3S13 6 14.2 8C13 10 10.9 12.7 8 12.7S3 10 1.8 8Z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <circle
                  cx="8"
                  cy="8"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
            </button>

            {/* Add to Cart */}
       <button
          onClick={() => handleAddToCart(toStoreItem(item))}
          disabled={added}
          className={`inline-flex items-center justify-center w-full sm:w-44 h-11 rounded-md border text-sm font-medium whitespace-nowrap ease-out duration-200 ${
            added
              ? "bg-[#16a34a] text-white border-[#16a34a] cursor-default"
              : "text-dark bg-gray-1 border-gray-3 hover:text-white hover:bg-blue hover:border-blue"
          }`}
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              aria-pressed={isWishlisted}
              className={`flex h-9 w-9 items-center justify-center rounded-[5px] bg-white shadow-1 duration-200 ease-out ${
                isWishlisted ? "text-red" : "text-dark hover:text-blue"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 13.4C3.6 10.2 1.3 8.2 1.3 5.8 1.3 4 2.6 2.7 4.3 2.7c1.5 0 2.6.9 3.7 2.2 1.1-1.3 2.2-2.2 3.7-2.2 1.7 0 3 1.3 3 3.1 0 2.4-2.3 4.4-6.7 7.6Z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7.5 lg:pl-11 lg:pr-12">
          <div className="min-w-0">
            {(item.brand || item.categories?.length > 0) && (
              <p className="mb-1.5 text-custom-sm text-dark-4">
                {[item.brand, item.categories?.[0]?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}

            <h3 className="mb-1.5 font-medium text-dark duration-200 ease-out hover:text-blue">
              <Link href={detailsHref}>{item.name}</Link>
            </h3>

            {item.description && (
              <p className="mb-2 line-clamp-2 max-w-md text-custom-sm text-dark-4">
                {item.description}
              </p>
            )}

            <span className="flex items-center gap-2 text-lg font-medium">
              <span className="text-dark">{formatPrice(price)}</span>

              {oldPrice !== null && (
                <span className="text-dark-4 line-through">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;
