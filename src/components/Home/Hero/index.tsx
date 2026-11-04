
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
                className="absolute bottom-0 right-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <div className="w-full xl:max-w-[393px]">
              <div className="flex flex-col gap-5 sm:flex-row xl:flex-col">
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
                      className="relative w-full rounded-[10px] bg-white p-4 sm:p-7.5"
                    >
                      <div className="flex items-center gap-5 sm:gap-8">
                        <div className="min-w-0 flex-1">
                          <h2 className="mb-20 max-w-[153px] text-xl font-semibold text-dark">
                            <Link
                              href={`/shop-details?id=${product.id}`}
                              className="hover:text-blue"
                            >
                              {product.name}
                            </Link>
                          </h2>

                          <div>
                            <p className="mb-1.5 text-custom-sm font-medium text-dark-4">
                              Popular product
                            </p>

                            <span className="flex flex-wrap items-center gap-3">
                              <span className="text-heading-5 font-medium text-red">
                                ${price.toFixed(2)}
                              </span>

                              {comparePrice != null &&
                                comparePrice > price && (
                                  <span className="text-2xl font-medium text-dark-4 line-through">
                                    ${comparePrice.toFixed(2)}
                                  </span>
                                )}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-center">
                          {primaryImage?.imageUrl && (
                            <Image
                              src={primaryImage.imageUrl}
                              alt={primaryImage.altText || product.name}
                              width={123}
                              height={161}
                              unoptimized
                              className="max-h-[161px] w-auto object-contain"
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
