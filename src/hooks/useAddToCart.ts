
"use client";

import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import type { AppDispatch, RootState } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";

type CartItemInput = Parameters<typeof addItemToCart>[0];

export const useAddToCart = () => {
  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector(
    (state: RootState) => state.cartReducer.items
  );

  const handleAddToCart = (item: CartItemInput) => {
    const existingItem = cartItems.some(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {
      toast.error("This product is already in your cart!", {
        id: `cart-duplicate-${item.id}`,
      });
      return;
    }

    dispatch(
      addItemToCart({
        ...item,
        quantity: 1,
      })
    );

    toast.success("Product added to cart successfully!", {
      id: `cart-added-${item.id}`,
    });
  };

  const isInCart = (itemId: CartItemInput["id"]) =>
    cartItems.some((cartItem) => cartItem.id === itemId);

  return { handleAddToCart, isInCart };
};
