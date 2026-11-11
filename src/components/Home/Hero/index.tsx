"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";

import { productService } from "@/services/productService";
import type { Product } from "@/types/product";

const Hero = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getAll();

        const featured = products.filter(
          (product) => product.isActive && product.isFeatured
        );

        setFeaturedProducts(featured.slice(0, 2));
      } catch (error) {
        console.error("Failed to load featured products:", error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="overflow-hidden bg-[#E5EAF4] pb-10 pt-57.5 sm:pt-45 lg:pb-12.5 lg:pt-30 xl:pb-15 xl:pt-51.5">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          {/* Main Hero Carousel */}
          <div className="w-full xl:max-w-[757px]">
            <div className="relative z-1 overflow-hidden rounded-[10px] bg-white">
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero background shapes"
                className="absolute bottom-0 right-0 -z-1 max-w-[60%] sm:max-w-none"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <div className="w-full xl:max-w-[393px]">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1">
                {featuredProducts.map((product) => {
                  const variant =
                    product.variants?.find((v) => v.isActive) ??
                    product.variants?.[0];

                  const price = variant?.price ?? 0;
                  const comparePrice = variant?.compareAtPrice;

                  const primaryImage =
                    product.images?.find((image) => image.isPrimary) ??
                    product.images?.[0];

                  return (
                    <div
                      key={product.id}
                      className="relative w-full rounded-[10px] bg-white p-4 sm:p-5 xl:p-7.5"
                    >
                      <div className="flex items-stretch gap-4 sm:gap-5 xl:gap-8">
                        {/* Text column */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <h2 className="line-clamp-2 text-lg font-semibold text-dark sm:text-xl">
                            <Link
                              href={`/shop-details?id=${product.id}`}
                              className="hover:text-blue"
                            >
                              {product.name}
                            </Link>
                          </h2>

                          {/* Buy Now: name aur Popular product ke beech center */}
                          <div className="flex flex-1 items-center py-4">
                            <Link
                              href={`/shop-details?id=${product.id}`}
                              className="inline-flex items-center justify-center rounded-md bg-blue px-6 py-2 text-custom-sm font-medium text-white duration-200 ease-out hover:bg-blue-dark"
                            >
                              Buy Now
                            </Link>
                          </div>

                          <div>
                            <p className="mb-1.5 text-custom-sm font-medium text-dark-4">
                              Popular product
                            </p>

                            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="text-xl font-medium text-red sm:text-2xl xl:text-heading-5">
                                ${price.toFixed(2)}
                              </span>

                              {comparePrice != null &&
                                comparePrice > price && (
                                  <span className="text-base font-medium text-dark-4 line-through sm:text-lg xl:text-2xl">
                                    ${comparePrice.toFixed(2)}
                                  </span>
                                )}
                            </span>
                          </div>
                        </div>

                        {/* Image column */}
                        <div className="relative h-[140px] w-[100px] shrink-0 sm:h-[150px] sm:w-[105px] xl:h-[161px] xl:w-[123px]">
                          {primaryImage?.imageUrl && (
                            <Image
                              src={primaryImage.imageUrl}
                              alt={primaryImage.altText || product.name}
                              fill
                              sizes="123px"
                              unoptimized
                              className="object-contain"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero Features */}
      <HeroFeature />
    </section>
  );
};

export default Hero;