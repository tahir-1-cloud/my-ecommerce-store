"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import WishlistHydration from "@/components/Common/WishlistHydration";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <WishlistHydration />
      {children}
    </Provider>
  );
}