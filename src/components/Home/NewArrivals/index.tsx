"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import ProductItem from "@/components/Common/ProductItem";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";

const NewArrival = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await productService.getAll();


        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        const newArrivals = response
          .filter((product) => {
            const createdAt = new Date(product.createdAt);

            return (
              product.isActive === true &&
              !Number.isNaN(createdAt.getTime()) &&
              createdAt >= sevenDaysAgo &&
              createdAt <= now
            );
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

        setProducts(newArrivals);
      } catch (error) {
        console.error("Failed to fetch new arrivals:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              {/* Existing icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.11826 15.4622C4.11794 16.6668 5.97853 16.6668 9.69971 16.6668H10.3007C14.0219 16.6668 15.8825 16.6668 16.8821 15.4622M3.11826 15.4622C2.11857 14.2577 2.46146 12.429 3.14723 8.77153C3.63491 6.17055 3.87875 4.87006 4.8045 4.10175M16.8821 15.4622C17.8818 14.2577 17.5389 12.429 16.8532 8.77153C16.3655 6.17055 16.1216 4.87006 15.1959 4.10175M15.1959 4.10175C14.2701 3.33345 12.947 3.33345 10.3007 3.33345H9.69971C7.0534 3.33345 5.73025 3.33345 4.8045 4.10175"
                  stroke="#3C50E0"
                  strokeWidth="1.5"
                />
                <path
                  d="M7.64258 6.66678C7.98578 7.63778 8.91181 8.33345 10.0003 8.33345C11.0888 8.33345 12.0149 7.63778 12.3581 6.66678"
                  stroke="#3C50E0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              This Week’s
            </span>

            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {loading ? (
            <p className="col-span-full text-center text-dark-2 py-8">
              Loading new arrivals...
            </p>
          ) : products.length > 0 ? (
            products.map((item) => (
              <ProductItem item={item} key={item.id} />
            ))
          ) : (
            <p className="col-span-full text-center text-dark-2 py-8">
              No new arrivals this week.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;