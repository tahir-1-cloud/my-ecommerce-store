"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { productService } from "@/services/productService";
import type { Product } from "@/types/product";

import { getProductImage } from "@/lib/helper/productHelpers";

type ProductWithDate = Product & { createdAt?: string };

const PromoBanner = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();

        const latestProducts = (response as ProductWithDate[])
          .filter((product) => product.isActive === true)
          .sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
            return b.id - a.id;
          })
          .slice(0, 3);

        setProducts(latestProducts);
      } catch (error) {
        console.error("Failed to load promo products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductPrice = (product: Product) => {
    const activeVariant =
      product.variants?.find((variant) => variant.isActive) ??
      product.variants?.[0];

    return {
      price: activeVariant?.price ?? 0,
      compareAtPrice: activeVariant?.compareAtPrice ?? null,
    };
  };

  const getDiscount = (product: Product) => {
    const { price, compareAtPrice } = getProductPrice(product);

    if (!compareAtPrice || compareAtPrice <= price || price <= 0) {
      return null;
    }

    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const getDescription = (product: Product) =>
    product.description || "Explore this product and discover its features.";

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;

  if (loading) {
    return (
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 gap-7.5">
            <div className="h-[300px] rounded-lg bg-gray-1 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7.5">
              <div className="h-[250px] rounded-lg bg-gray-1 animate-pulse" />
              <div className="h-[250px] rounded-lg bg-gray-1 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const [firstProduct, secondProduct, thirdProduct] = products;

  const firstImage = firstProduct ? getProductImage(firstProduct) : null;
  const secondImage = secondProduct ? getProductImage(secondProduct) : null;
  const thirdImage = thirdProduct ? getProductImage(thirdProduct) : null;

  const firstDiscount = firstProduct ? getDiscount(firstProduct) : null;
  const secondDiscount = secondProduct ? getDiscount(secondProduct) : null;
  const thirdDiscount = thirdProduct ? getDiscount(thirdProduct) : null;

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Big Promo Banner */}
        {firstProduct && (
          <div className="group relative isolate overflow-hidden rounded-lg bg-[#F5F5F7] mb-7.5">
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 lg:px-14 xl:px-19 py-10 lg:py-14 xl:py-16">
              {/* Text */}
              <div className="relative z-10 w-full lg:max-w-[520px]">
                {firstDiscount && (
                  <span className="mb-4 inline-flex rounded-full bg-blue px-3.5 py-1 text-custom-sm font-medium text-white">
                    Save {firstDiscount}%
                  </span>
                )}

                <span className="block font-medium text-xl text-dark mb-3 line-clamp-1">
                  {firstProduct.name}
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                  {firstDiscount
                    ? `UP TO ${firstDiscount}% OFF`
                    : formatPrice(getProductPrice(firstProduct).price)}
                </h2>

                <p className="line-clamp-3">{getDescription(firstProduct)}</p>

                <Link
                  href={`/shop-details?id=${firstProduct.id}`}
                  className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
                >
                  Buy Now
                </Link>
              </div>

              {/* Image (alag column, text ke upar kabhi nahi aati) */}
              <div className="relative z-0 mx-auto flex h-[260px] w-full max-w-[320px] shrink-0 items-center justify-center lg:mx-0 lg:h-[320px] lg:max-w-[360px]">
                <span className="absolute h-[85%] w-[85%] rounded-full bg-white/70 transition-transform duration-500 group-hover:scale-105" />

                {firstImage && (
                  <Image
                    src={firstImage}
                    alt={firstProduct.name}
                    fill
                    sizes="(min-width: 1024px) 360px, 320px"
                    className="relative object-contain p-4 drop-shadow-[0_18px_24px_rgba(15,23,42,0.18)] transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Two Small Promo Banners */}
        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* Second Product */}
          {secondProduct && (
            <div className="group relative isolate overflow-hidden rounded-lg bg-[#DBF4F3]">
              <div className="relative flex items-center gap-4 px-4 sm:px-7.5 xl:px-10 py-8 xl:py-10">
                {/* Image */}
                <div className="relative z-0 h-[170px] w-[42%] max-w-[220px] shrink-0 sm:h-[200px]">
                  <span className="absolute inset-3 rounded-full bg-white/60 transition-transform duration-500 group-hover:scale-105" />

                  {secondImage && (
                    <Image
                      src={secondImage}
                      alt={secondProduct.name}
                      fill
                      sizes="220px"
                      className="relative object-contain p-2 drop-shadow-[0_14px_18px_rgba(15,23,42,0.18)] transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  )}
                </div>

                {/* Text */}
                <div className="relative z-10 min-w-0 flex-1 text-right">
                  <span className="block text-lg text-dark mb-1.5 line-clamp-1">
                    {secondProduct.name}
                  </span>

                  <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                    {formatPrice(getProductPrice(secondProduct).price)}
                  </h2>

                  <p className="font-semibold text-custom-1 text-teal">
                    {secondDiscount
                      ? `Flat ${secondDiscount}% off`
                      : "Explore Product"}
                  </p>

                  <Link
                    href={`/shop-details?id=${secondProduct.id}`}
                    className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-7"
                  >
                    Grab Now
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Third Product */}
          {thirdProduct && (
            <div className="group relative isolate overflow-hidden rounded-lg bg-[#FFECE1]">
              <div className="relative flex items-center gap-4 px-4 sm:px-7.5 xl:px-10 py-8 xl:py-10">
                {/* Text */}
                <div className="relative z-10 min-w-0 flex-1">
                  <span className="block text-lg text-dark mb-1.5 line-clamp-1">
                    {thirdProduct.name}
                  </span>

                  <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                    {thirdDiscount ? (
                      <>
                        Up to{" "}
                        <span className="text-orange">{thirdDiscount}%</span>{" "}
                        off
                      </>
                    ) : (
                      formatPrice(getProductPrice(thirdProduct).price)
                    )}
                  </h2>

                  <p className="max-w-[285px] text-custom-sm line-clamp-2">
                    {getDescription(thirdProduct)}
                  </p>

                  <Link
                    href={`/shop-details?id=${thirdProduct.id}`}
                    className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7"
                  >
                    Buy Now
                  </Link>
                </div>

                {/* Image */}
                <div className="relative z-0 h-[170px] w-[42%] max-w-[220px] shrink-0 sm:h-[200px]">
                  <span className="absolute inset-3 rounded-full bg-white/60 transition-transform duration-500 group-hover:scale-105" />

                  {thirdImage && (
                    <Image
                      src={thirdImage}
                      alt={thirdProduct.name}
                      fill
                      sizes="220px"
                      className="relative object-contain p-2 drop-shadow-[0_14px_18px_rgba(15,23,42,0.18)] transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;