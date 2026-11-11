import React from "react";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recently Viewed | NextCommerce",
  description: "Products you have recently viewed",
};

const RecentlyViewedPage = () => {
  return (
    <main>
      <RecentlyViewed />
    </main>
  );
};

export default RecentlyViewedPage;