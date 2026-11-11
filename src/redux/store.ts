
import {
  configureStore,
  type Middleware,
} from "@reduxjs/toolkit";

import quickViewReducer from "./features/quickView-slice";
import cartReducer from "./features/cart-slice";
import wishlistReducer from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";
import recentlyViewedReducer from "./features/recently-viewed-slice";


export const WISHLIST_STORAGE_KEY = "guest-wishlist";
export const CART_STORAGE_KEY = "guest-cart";
export const RECENTLY_VIEWED_STORAGE_KEY = "recently-viewed";
// Wishlist Persistence
const wishlistPersistenceMiddleware: Middleware =
  (storeAPI) => (next) => (action) => {
    const result = next(action);

    if (
      typeof window !== "undefined" &&
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

// Cart Persistence
const cartPersistenceMiddleware: Middleware =
  (storeAPI) => (next) => (action) => {
    const result = next(action);

    if (
      typeof window !== "undefined" &&
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof action.type === "string" &&
      action.type.startsWith("cart/") &&
      action.type !== "cart/setCartItems"
    ) {
      try {
        const cartItems = storeAPI.getState().cartReducer.items;

        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(cartItems)
        );
      } catch (error) {
        console.error("Unable to save cart:", error);
      }
    }

    return result;
  };

// Recently Viewed Persistence
const recentlyViewedPersistenceMiddleware: Middleware =
  (storeAPI) => (next) => (action) => {
    const result = next(action);

    if (
      typeof window !== "undefined" &&
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof action.type === "string" &&
      action.type.startsWith("recentlyViewed/") &&
      action.type !== "recentlyViewed/setRecentlyViewedItems"
    ) {
      try {
        const items =
          storeAPI.getState().recentlyViewedReducer.items;

        localStorage.setItem(
          RECENTLY_VIEWED_STORAGE_KEY,
          JSON.stringify(items)
        );
      } catch (error) {
        console.error("Unable to save recently viewed:", error);
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
    recentlyViewedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      wishlistPersistenceMiddleware,
      cartPersistenceMiddleware,
      recentlyViewedPersistenceMiddleware
    ),
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
