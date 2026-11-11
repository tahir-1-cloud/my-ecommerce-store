
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RecentlyViewedItem = {
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
  items: RecentlyViewedItem[];
};

const initialState: InitialState = {
  items: [],
};

const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState,
  reducers: {
    addRecentlyViewed: (
      state,
      action: PayloadAction<RecentlyViewedItem>
    ) => {
      // Remove duplicate product if it already exists.
      state.items = state.items.filter(
        (item) => item.id !== action.payload.id
      );

      // Add the latest viewed product at the beginning.
      state.items.unshift(action.payload);

      // Keep only the latest 10 products.
      state.items = state.items.slice(0, 10);
    },

    setRecentlyViewedItems: (
      state,
      action: PayloadAction<RecentlyViewedItem[]>
    ) => {
      state.items = action.payload.slice(0, 10);
    },

    removeRecentlyViewed: (
      state,
      action: PayloadAction<number>
    ) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    clearRecentlyViewed: (state) => {
      state.items = [];
    },
  },
});

export const {
  addRecentlyViewed,
  setRecentlyViewedItems,
  removeRecentlyViewed,
  clearRecentlyViewed,
} = recentlyViewedSlice.actions;

export default recentlyViewedSlice.reducer;
