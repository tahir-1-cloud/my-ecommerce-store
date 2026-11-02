import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WishListItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: WishListItem[];
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Add only if the product is not already in the wishlist.
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (!existingItem) {
        state.items.push({
          ...action.payload,
          quantity: 1,
        });
      }
    },

    // Clicking the heart toggles the product.
    toggleWishlistItem: (state, action: PayloadAction<WishListItem>) => {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push({
          ...action.payload,
          quantity: 1,
        });
      }
    },

    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },

    // Restore wishlist from localStorage.
    setWishlistItems: (state, action: PayloadAction<WishListItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addItemToWishlist,
  toggleWishlistItem,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
  setWishlistItems,
} = wishlist.actions;

export default wishlist.reducer;