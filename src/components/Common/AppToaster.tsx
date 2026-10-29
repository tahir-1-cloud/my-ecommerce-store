"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{ top: 88, right: 16 }}
    />
  );
}