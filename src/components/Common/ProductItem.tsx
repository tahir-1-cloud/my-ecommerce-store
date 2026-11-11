"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { toggleWishlistItem } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  formatPrice,
  getPriceInfo,
  getProductImage,
  toStoreItem,
} from "@/lib/helper/productHelpers";
import { useAddToCart } from "@/hooks/useAddToCart";

const ProductItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { handleAddToCart, isInCart } = useAddToCart();

  const storeItem = toStoreItem(item);
  const image = getProductImage(item);
  const { price, oldPrice } = getPriceInfo(item);

  const added = isInCart(item.id);

  // Wishlist state (cart ki tarah store se)
  const wishlistItems = useSelector(
    (state: RootState) => state.wishlistReducer.items
  );
  const isWishlisted = wishlistItems.some(
    (wishItem: { id: number }) => wishItem.id === item.id
  );

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...storeItem }));
  };

  const handleItemToWishList = () => {
    dispatch(
      toggleWishlistItem({
        ...storeItem,
        status: "available",
        quantity: 1,
      })
    );
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...storeItem }));
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-[#F6F7FB] min-h-[270px] mb-4">
        {image ? (
          <Image src={image} alt={item.name} width={250} height={250} />
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-gray-4">
            No image available
          </div>
        )}

        {/* Wishlist par red heart hamesha nazar aaye */}
        {isWishlisted && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red shadow-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 13.4C3.6 10.2 1.3 8.2 1.3 5.8 1.3 4 2.6 2.7 4.3 2.7c1.5 0 2.6.9 3.7 2.2 1.1-1.3 2.2-2.2 3.7-2.2 1.7 0 3 1.3 3 3.1 0 2.4-2.3 4.4-6.7 7.6Z" />
            </svg>
          </span>
        )}

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            type="button"
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            aria-label="button for quick view"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M1.8 8C3 6 5.1 3.3 8 3.3S13 6 14.2 8C13 10 10.9 12.7 8 12.7S3 10 1.8 8Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          </button>

          <button
            type="button"
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

          <button
            type="button"
            onClick={handleItemToWishList}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            className={`flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 bg-white ${
              isWishlisted ? "text-red" : "text-dark hover:text-red"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill={isWishlisted ? "currentColor" : "none"}
              aria-hidden="true"
            >
              <path
                d="M8 13.4C3.6 10.2 1.3 8.2 1.3 5.8 1.3 4 2.6 2.7 4.3 2.7c1.5 0 2.6.9 3.7 2.2 1.1-1.3 2.2-2.2 3.7-2.2 1.7 0 3 1.3 3 3.1 0 2.4-2.3 4.4-6.7 7.6Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Image
              key={i}
              src="/images/icons/icon-star.svg"
              alt="star icon"
              width={14}
              height={14}
            />
          ))}
        </div>

        <p className="text-custom-sm">({storeItem.reviews})</p>
      </div>

      <h3
        className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5"
        onClick={handleProductDetails}
      >
        <Link href={`/shop-details?id=${item.id}`}>{item.name}</Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark">{formatPrice(price)}</span>
        {oldPrice !== null && (
          <span className="text-dark-4 line-through">{formatPrice(oldPrice)}</span>
        )}
      </span>
    </div>
  );
};

export default ProductItem;