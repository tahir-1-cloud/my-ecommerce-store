
"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";



import Image from "next/image";
import Link from "next/link";

import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import { getProductImage } from "@/lib/helper/productHelpers";

type ProductWithDate = Product & {
  createdAt?: string;
};

const HeroCarousal = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();

        const latestProducts = (response as ProductWithDate[])
          .filter((product) => product.isActive === true)
          .sort((a, b) => {
            const dateA = a.createdAt
              ? new Date(a.createdAt).getTime()
              : 0;

            const dateB = b.createdAt
              ? new Date(b.createdAt).getTime()
              : 0;

            if (dateA !== dateB) {
              return dateB - dateA;
            }

            return b.id - a.id;
          })
          .slice(0, 6);

        if (isMounted) {
          setProducts(latestProducts);
        }
      } catch (error) {
        console.error("Failed to load hero products:", error);

        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const getProductPrice = (product: Product) => {
    const activeVariant =
      product.variants?.find((variant) => variant.isActive) ??
      product.variants?.[0];

    return {
      price: activeVariant?.price ?? null,
      compareAtPrice: activeVariant?.compareAtPrice ?? null,
    };
  };

  const getDiscount = (product: Product) => {
    const { price, compareAtPrice } = getProductPrice(product);

    if (
      price === null ||
      compareAtPrice === null ||
      compareAtPrice <= price ||
      price <= 0
    ) {
      return null;
    }

    return Math.round(
      ((compareAtPrice - price) / compareAtPrice) * 100
    );
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  if (loading) {
    return (
      <section className="overflow-hidden">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="h-[400px] sm:h-[460px] rounded-lg bg-gray-1 animate-pulse" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          loop={products.length > 1}
          autoplay={
            products.length > 1
              ? {
                  delay: 2500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, Pagination]}
          className="hero-carousel"
        >
          {products.map((product) => {
            const image = getProductImage(product);
            const { price } = getProductPrice(product);
            const discount = getDiscount(product);

            return (
              <SwiperSlide key={product.id}>
                <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
                  {/* Product Information */}
                  <div className="w-full max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
                    <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                      <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                        {discount !== null
                          ? `${discount}%`
                          : price !== null
                            ? formatPrice(price)
                            : ""}
                      </span>

                      <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                        {discount !== null ? (
                          <>
                            Sale
                            <br />
                            Off
                          </>
                        ) : price !== null ? (
                          "Price"
                        ) : null}
                      </span>
                    </div>

                    <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3 line-clamp-2">
                      {product.name}
                    </h1>

                    {product.description && (
                      <p className="line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    <Link
                      href={`/shop-details?id=${product.id}`}
                      className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
                    >
                      Shop Now
                    </Link>
                  </div>

                  {/* Product Image */}
                  <div className="relative flex w-full max-w-[351px] h-[280px] sm:h-[358px] items-center justify-center mx-auto">
                    {image && (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 351px"
                        className="object-contain"
                        unoptimized
                        priority={false}
                      />
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default HeroCarousal;
