import { createSlice } from "@reduxjs/toolkit";
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
export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;
