import {
  configureStore,
  type Middleware,
} from "@reduxjs/toolkit";

import quickViewReducer from "./features/quickView-slice";
import cartReducer from "./features/cart-slice";
import wishlistReducer from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";

const WISHLIST_STORAGE_KEY = "guest-wishlist";

const wishlistPersistenceMiddleware: Middleware =
  (storeAPI) => (next) => (action) => {
    const result = next(action);

    if (
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof action.type === "string" &&
      action.type.startsWith("wishlist/") &&
      action.type !== "wishlist/setWishlistItems"
    ) {
      try {
        const wishlistItems = storeAPI.getState().wishlistReducer.items;

        localStorage.setItem(
          WISHLIST_STORAGE_KEY,
          JSON.stringify(wishlistItems)
        );
      } catch (error) {
        console.error("Unable to save wishlist:", error);
      }
    }

    return result;
  };

export const store = configureStore({
  reducer: {
    quickViewReducer,
    cartReducer,
    wishlistReducer,
    productDetailsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(wishlistPersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export { WISHLIST_STORAGE_KEY };