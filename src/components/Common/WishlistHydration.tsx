"use client";

import { useEffect } from "react";
import {
  setWishlistItems,
  type WishListItem,
} from "@/redux/features/wishlist-slice";
import {
  useAppDispatch,
  WISHLIST_STORAGE_KEY,
} from "@/redux/store";

const WishlistHydration = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(
        WISHLIST_STORAGE_KEY
      );

      if (savedWishlist) {
        const parsedItems: unknown = JSON.parse(savedWishlist);

        if (
          Array.isArray(parsedItems) &&
          parsedItems.every(
            (item) =>
              typeof item.id === "number" &&
              typeof item.title === "string"
          )
        ) {
          dispatch(setWishlistItems(parsedItems as WishListItem[]));
        }
      }
    } catch (error) {
      console.error("Unable to restore wishlist:", error);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    }
  }, [dispatch]);

  return null;
};

export default WishlistHydration;