
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

export type CartItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const {
        id,
        title,
        price,
        quantity,
        discountedPrice,
        imgs,
      } = action.payload;

      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          discountedPrice,
          imgs,
        });
      }
    },

    removeItemFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;

      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },

    // Restore cart from localStorage
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const selectCartItems = (state: RootState) =>
  state.cartReducer.items;

export const selectTotalPrice = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce(
      (total, item) => total + item.discountedPrice * item.quantity,
      0
    )
);

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  setCartItems,
} = cart.actions;

export default cart.reducer;
