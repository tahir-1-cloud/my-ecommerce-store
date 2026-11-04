
"use client";

import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import SingleItem from "./SingleItem";

export const Wishlist = () => {
  const dispatch = useAppDispatch();

  const wishlistItems = useAppSelector(
    (state) => state.wishlistReducer.items
  );

  const handleClearWishlist = () => {
    dispatch(removeAllItemsFromWishlist());
  };

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="mb-7.5 flex flex-wrap items-center justify-between gap-5">
            <h2 className="text-2xl font-medium text-dark">
              Your Wishlist ({wishlistItems.length})
            </h2>

            <button
              type="button"
              onClick={handleClearWishlist}
              disabled={wishlistItems.length === 0}
              className="text-blue disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Wishlist Cart
            </button>
          </div>

          <div className="rounded-[10px] bg-white shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                <div className="flex items-center px-10 py-5.5">
                  <div className="min-w-[83px]" />

                  <div className="min-w-[387px]">
                    <p className="text-dark">Product</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-dark">Unit Price</p>
                  </div>

               

                  <div className="min-w-[150px]">
                    <p className="text-right text-dark">Action</p>
                  </div>
                </div>

                {wishlistItems.length > 0 ? (
                  wishlistItems.map((item) => (
                    <SingleItem item={item} key={item.id} />
                  ))
                ) : (
                  <div className="px-10 py-12 text-center text-dark-4">
                    Your wishlist is empty.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
