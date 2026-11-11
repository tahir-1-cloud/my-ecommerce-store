"use client";

import { useEffect } from "react";

import {
  setRecentlyViewedItems,
  type RecentlyViewedItem,
} from "@/redux/features/recently-viewed-slice";

import {
  useAppDispatch,
  RECENTLY_VIEWED_STORAGE_KEY,
} from "@/redux/store";

const RecentlyViewedHydration = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(
        RECENTLY_VIEWED_STORAGE_KEY
      );

      if (savedItems) {
        const parsedItems: unknown = JSON.parse(savedItems);

        if (
          Array.isArray(parsedItems) &&
          parsedItems.every(
            (item) =>
              typeof item.id === "number" &&
              typeof item.title === "string"
          )
        ) {
          dispatch(
            setRecentlyViewedItems(
              parsedItems as RecentlyViewedItem[]
            )
          );
        }
      }
    } catch (error) {
      console.error(
        "Unable to restore recently viewed:",
        error
      );

      localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    }
  }, [dispatch]);

  return null;
};

export default RecentlyViewedHydration;