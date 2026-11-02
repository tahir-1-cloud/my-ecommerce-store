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
import { toggleWishlistItem } from "@/redux/features/wishlist-slice";
import { useAppSelector } from "@/redux/store";
import {
  formatPrice,
  getPriceInfo,
  getProductImage,
  toStoreItem,
} from "@/lib/helper/productHelpers";

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const image = getProductImage(item);
  const { price, oldPrice } = getPriceInfo(item);
  const categoryName = item.categories?.[0]?.name;
  const detailsHref = `/shop-details?id=${item.id}`;

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView(toStoreItem(item) as any));
  };


  const isWishlisted = useAppSelector((state) =>
  state.wishlistReducer.items.some((wishItem) => wishItem.id === item.id)
);
const handleAddToCart = () => {
  dispatch(addItemToCart({ ...toStoreItem(item), quantity: 1 } as any));
};

const handleItemToWishList = () => {
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
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white shadow-1 min-h-[270px] mb-4">
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
              d="M8 13.4C3.6 10.2 1.3 8.2 1.3 5.8 1.3 4 2.6 2.7 4.3 2.7c1.5 0 2.6.9 3.7 2.2 1.1-1.3 2.2-2.2 3.7-2.2 1.7 0 3 1.3 3 3.1 0 2.4-2.3 4.4-6.7 7.6Z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinejoin="round"
              fill={isWishlisted ? "currentColor" : "none"}
            />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          </button>

       <button
        type="button"
        onClick={handleAddToCart}
        className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
      >
        Add to cart
      </button>

          <button
            type="button"
            onClick={handleItemToWishList}
            aria-label="button for favorite select"
         className={`flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 bg-white ${
  isWishlisted ? "text-red" : "text-dark hover:text-blue"
}`}>
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

      {(item.brand || categoryName) && (
        <p className="mb-1.5 text-custom-sm text-dark-4">
          {[item.brand, categoryName].filter(Boolean).join(" · ")}
        </p>
      )}

      <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
        <Link href={detailsHref}>{item.name}</Link>
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

export default SingleGridItem;