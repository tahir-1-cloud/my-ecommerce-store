"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import {
  formatPrice,
  getPriceInfo,
  getProductImage,
  isInStock,
  toStoreItem,
} from "@/lib/helper/productHelpers";

const SingleListItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const image = getProductImage(item);
  const { price, oldPrice } = getPriceInfo(item);
  const inStock = isInStock(item);
  const detailsHref = `/shop-details?id=${item.id}`;

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView(toStoreItem(item) as any));
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    dispatch(addItemToCart({ ...toStoreItem(item), quantity: 1 } as any));
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        ...toStoreItem(item),
        status: inStock ? "available" : "out-of-stock",
        quantity: 1,
      } as any)
    );
  };

  return (
    <div className="group rounded-lg bg-white shadow-1">
      <div className="flex">
        <div className="shadow-list relative overflow-hidden flex items-center justify-center max-w-[270px] w-full sm:min-h-[270px] p-4">
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
              onClick={handleAddToCart}
              disabled={!inStock}
              className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-4"
            >
              {inStock ? "Add to cart" : "Sold out"}
            </button>

            <button
              type="button"
              onClick={handleItemToWishList}
              aria-label="button for favorite select"
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

        <div className="w-full flex flex-col gap-5 sm:flex-row sm:items-center justify-center sm:justify-between py-5 px-4 sm:px-7.5 lg:pl-11 lg:pr-12">
          <div className="min-w-0">
            {(item.brand || item.categories?.length > 0) && (
              <p className="mb-1.5 text-custom-sm text-dark-4">
                {[item.brand, item.categories?.[0]?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}

            <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
              <Link href={detailsHref}>{item.name}</Link>
            </h3>

            {item.description && (
              <p className="mb-2 line-clamp-2 max-w-md text-custom-sm text-dark-4">
                {item.description}
              </p>
            )}

            <span className="flex items-center gap-2 font-medium text-lg">
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