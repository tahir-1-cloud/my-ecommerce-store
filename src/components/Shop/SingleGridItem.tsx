
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
  toStoreItem,
} from "@/lib/helper/productHelpers";

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useAppDispatch();

  const image = getProductImage(item);
  const { price, oldPrice } = getPriceInfo(item);
  const categoryName = item.categories?.[0]?.name;
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

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...toStoreItem(item),
        quantity: 1,
      } as any)
    );
  };

  const handleToggleWishlist = () => {
    dispatch(
      toggleWishlistItem({
        ...toStoreItem(item),
        status: "available",
        quantity: 1,
      } as any)
    );
  };

  return (
    <div className="group">
      <div className="relative mb-4 flex min-h-[270px] items-center justify-center overflow-hidden rounded-lg bg-white shadow-1">
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

        {item.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-blue px-3 py-1 text-xs font-medium text-white">
            Featured
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
            type="button"
            onClick={handleAddToCart}
            className="inline-flex rounded-[5px] bg-blue px-5 py-[7px] text-custom-sm font-medium text-white duration-200 ease-out hover:bg-blue-dark"
          >
            Add to cart
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

      {(item.brand || categoryName) && (
        <p className="mb-1.5 text-custom-sm text-dark-4">
          {[item.brand, categoryName].filter(Boolean).join(" · ")}
        </p>
      )}

      <h3 className="mb-1.5 font-medium text-dark duration-200 ease-out hover:text-blue">
        <Link href={detailsHref}>{item.name}</Link>
      </h3>

      <span className="flex items-center gap-2 text-lg font-medium">
        <span className="text-dark">{formatPrice(price)}</span>

        {oldPrice !== null && (
          <span className="text-dark-4 line-through">
            {formatPrice(oldPrice)}
          </span>
        )}
      </span>
    </div>
  );
};

export default SingleGridItem;
