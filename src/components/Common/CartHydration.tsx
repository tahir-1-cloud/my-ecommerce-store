
"use client";

import { useEffect } from "react";
import {
  setCartItems,
  type CartItem,
} from "@/redux/features/cart-slice";
import {
  useAppDispatch,
  CART_STORAGE_KEY,
} from "@/redux/store";

const CartHydration = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedItems: unknown = JSON.parse(savedCart);

        if (
          Array.isArray(parsedItems) &&
          parsedItems.every(
            (item) =>
              typeof item.id === "number" &&
              typeof item.title === "string" &&
              typeof item.price === "number" &&
              typeof item.discountedPrice === "number" &&
              typeof item.quantity === "number"
          )
        ) {
          dispatch(setCartItems(parsedItems as CartItem[]));
        }
      }
    } catch (error) {
      console.error("Unable to restore cart:", error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [dispatch]);

  return null;
};

export default CartHydration;
