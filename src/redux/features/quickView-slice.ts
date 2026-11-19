import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

interface InitialState {
  value: Product;
}

const initialState: InitialState = {
  value: {
    id: 0,
    name: "",
    slug: "",
    description: null,
    brand: null,
    isActive: false,
    createdAt: "",
    isFeatured: false,
    categoryIds: [],
    categories: [],
    variants: [],
    images: [],
  },
};

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: () => {
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;
