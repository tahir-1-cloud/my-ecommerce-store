
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";

const ShopDetails = () => {
  const { openPreviewModal } = usePreviewSlider();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewImg, setPreviewImg] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tabOne");

  // Fetch product using ID from the URL.
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        const productId = new URLSearchParams(window.location.search).get("id");

        if (!productId || !Number.isInteger(Number(productId)) || Number(productId) <= 0) {
          throw new Error("Invalid product ID.");
        }

        const data = await productService.getById(Number(productId));

        if (!data) {
          throw new Error("Product not found.");
        }

        if (isMounted) {
          setProduct(data);

          const activeVariant = data.variants?.find(
            (variant) => variant.isActive
          );

          setSelectedVariantId(
            activeVariant?.id ?? data.variants?.[0]?.id ?? null
          );
        }
      } catch (err) {
        console.error("Failed to load product:", err);

        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load product details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, []);

  const images = useMemo(
    () =>
      [...(product?.images ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder
      ),
    [product?.images]
  );

  const selectedVariant = useMemo(
    () =>
      product?.variants?.find(
        (variant) => variant.id === selectedVariantId
      ) ??
      product?.variants?.find((variant) => variant.isActive) ??
      product?.variants?.[0],
    [product, selectedVariantId]
  );

  const primaryImage =
    images.find((image) => image.isPrimary) ?? images[0];

  const currentImage = images[previewImg] ?? primaryImage;

  const price = selectedVariant?.price ?? 0;
  const compareAtPrice = selectedVariant?.compareAtPrice;

  const hasDiscount =
    compareAtPrice !== null &&
    compareAtPrice !== undefined &&
    compareAtPrice > price;

  const discountPercentage = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const inStock = (selectedVariant?.stockQuantity ?? 0) > 0;

  const tabs = [
    { id: "tabOne", title: "Description" },
    { id: "tabTwo", title: "Additional Information" },
    { id: "tabThree", title: "Reviews" },
  ];

  const handlePreviewSlider = () => {
    openPreviewModal();
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title="Shop Details" pages={["shop details"]} />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-3 border-t-blue" />
            <p className="text-dark-4">Loading product details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Breadcrumb title="Shop Details" pages={["shop details"]} />
        <div className="flex min-h-[400px] items-center justify-center px-4">
          <div className="text-center">
            <h2 className="mb-3 text-xl font-semibold text-dark">
              Product not found
            </h2>
            <p className="text-dark-4">
              {error || "The requested product could not be found."}
            </p>
          </div>
        </div>
        <Newsletter />
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Shop Details" pages={["shop details"]} />

      <section className="relative overflow-hidden pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col gap-7.5 lg:flex-row xl:gap-17.5">
            {/* Product Images */}
            <div className="w-full lg:max-w-[570px]">
              <div className="relative flex items-center justify-center rounded-lg bg-gray-2 p-4 shadow-1 sm:p-7.5 lg:min-h-[512px]">
                <button
                  type="button"
                  onClick={handlePreviewSlider}
                  aria-label="Zoom product image"
                  className="gallery__Image absolute right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-[5px] bg-gray-1 text-dark shadow-1 duration-200 ease-out hover:text-blue lg:right-6 lg:top-6"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z"
                      fill=""
                    />
                  </svg>
                </button>

                {currentImage?.imageUrl ? (
                  <Image
                    src={currentImage.imageUrl}
                    alt={currentImage.altText || product.name}
                    width={500}
                    height={500}
                    priority
                    unoptimized
                    className="max-h-[450px] w-auto object-contain"
                  />
                ) : (
                  <div className="flex min-h-[350px] items-center justify-center text-dark-4">
                    No product image available
                  </div>
                )}
              </div>

              {/* Product Thumbnails */}
              {images.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4.5 sm:flex-nowrap">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      onClick={() => setPreviewImg(index)}
                      key={image.id}
                      className={`flex h-15 w-15 items-center justify-center overflow-hidden rounded-lg border-2 bg-gray-2 shadow-1 duration-200 ease-out hover:border-blue sm:h-25 sm:w-25 ${
                        index === previewImg
                          ? "border-blue"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        width={100}
                        height={100}
                        src={image.imageUrl}
                        alt={image.altText || product.name}
                        unoptimized
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="w-full max-w-[539px]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-dark sm:text-2xl xl:text-custom-3">
                  {product.name}
                </h2>

                {hasDiscount && (
                  <div className="inline-flex shrink-0 rounded bg-blue px-2.5 py-0.5 text-custom-sm font-medium text-white">
                    {discountPercentage}% OFF
                  </div>
                )}
              </div>

              <div className="mb-4.5 flex flex-wrap items-center gap-5.5">
                <div className="flex items-center gap-1.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                      fill="#22AD5C"
                    />
                    <path
                      d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                      fill="#22AD5C"
                    />
                  </svg>

                  <span className={inStock ? "text-green" : "text-red"}>
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <span className="text-dark-4">
                  {product.categories?.map((category) => category.name).join(", ")}
                </span>
              </div>

              {/* Price */}
              <h3 className="mb-4.5 font-medium text-custom-1">
                <span className="text-sm text-dark sm:text-base">
                  Price: ${price.toFixed(2)}
                </span>

                {hasDiscount && (
                  <span className="ml-2 line-through text-dark-4">
                    ${compareAtPrice.toFixed(2)}
                  </span>
                )}
              </h3>

              {/* Product Details */}
              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-2.5">
                  <span className="text-blue">✓</span>
                  {product.brand || "Quality product"}
                </li>

                <li className="flex items-center gap-2.5">
                  <span className="text-blue">✓</span>
                  {product.isFeatured
                    ? "Featured product"
                    : "Available in our store"}
                </li>
              </ul>

              <form onSubmit={(event) => event.preventDefault()}>
                <div className="mt-7.5 mb-9 flex flex-col gap-4.5 border-y border-gray-3 py-9">
                  {/* Product Variants */}
                  <div className="flex items-start gap-4">
                    <div className="min-w-[65px]">
                      <h4 className="font-medium text-dark">Variant:</h4>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {product.variants?.length ? (
                        product.variants.map((variant) => (
                          <label
                            key={variant.id}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <input
                              type="radio"
                              name="productVariant"
                              value={variant.id}
                              checked={selectedVariantId === variant.id}
                              disabled={!variant.isActive}
                              onChange={() =>
                                setSelectedVariantId(variant.id)
                              }
                              className="h-4 w-4 accent-blue"
                            />

                            <span
                              className={
                                variant.isActive
                                  ? "text-dark"
                                  : "text-dark-4"
                              }
                            >
                              {variant.sku}
                            </span>
                          </label>
                        ))
                      ) : (
                        <span className="text-dark-4">
                          No variants available
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedVariant && (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="min-w-[65px]">
                          <h4 className="font-medium text-dark">SKU:</h4>
                        </div>
                        <span className="text-dark-4">
                          {selectedVariant.sku}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="min-w-[65px]">
                          <h4 className="font-medium text-dark">Stock:</h4>
                        </div>
                        <span className="text-dark-4">
                          {selectedVariant.stockQuantity} available
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex flex-wrap items-center gap-4.5">
                  <div className="flex items-center rounded-md border border-gray-3">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                      className="flex h-12 w-12 items-center justify-center duration-200 ease-out hover:text-blue disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() =>
                        setQuantity((current) => Math.max(1, current - 1))
                      }
                    >
                      −
                    </button>

                    <span className="flex h-12 w-16 items-center justify-center border-x border-gray-4">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={
                        !inStock ||
                        quantity >= (selectedVariant?.stockQuantity ?? 0)
                      }
                      className="flex h-12 w-12 items-center justify-center duration-200 ease-out hover:text-blue disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(
                            selectedVariant?.stockQuantity ?? current,
                            current + 1
                          )
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!inStock || !selectedVariant}
                    className="inline-flex rounded-md bg-blue px-7 py-3 font-medium text-white duration-200 ease-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Purchase Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center gap-5 rounded-[10px] bg-white px-4 py-4.5 shadow-1 sm:px-6 xl:gap-12.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative font-medium duration-200 ease-out hover:text-blue lg:text-lg ${
                  activeTab === tab.id
                    ? "text-blue before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-blue"
                    : "text-dark"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Description */}
          {activeTab === "tabOne" && (
            <div className="mt-12.5 rounded-xl bg-white p-4 shadow-1 sm:p-6">
              <h2 className="mb-7 font-medium text-2xl text-dark">
                Product Description
              </h2>

              <p className="whitespace-pre-line text-dark-4">
                {product.description || "No description available for this product."}
              </p>
            </div>
          )}

          {/* Additional Information */}
          {activeTab === "tabTwo" && (
            <div className="mt-10 rounded-xl bg-white p-4 shadow-1 sm:p-6">
              {[
                { label: "Product Name", value: product.name },
                { label: "Brand", value: product.brand || "Not specified" },
                { label: "Slug", value: product.slug },
                {
                  label: "Categories",
                  value:
                    product.categories?.map((category) => category.name).join(", ") ||
                    "Not specified",
                },
                {
                  label: "Product Status",
                  value: product.isActive ? "Active" : "Inactive",
                },
                {
                  label: "Featured",
                  value: product.isFeatured ? "Yes" : "No",
                },
                {
                  label: "Variants",
                  value: String(product.variants?.length ?? 0),
                },
                {
                  label: "Images",
                  value: String(product.images?.length ?? 0),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex rounded-md px-4 py-4 even:bg-gray-1 sm:px-5"
                >
                  <div className="w-full min-w-[140px] max-w-[450px]">
                    <p className="text-sm text-dark sm:text-base">
                      {item.label}
                    </p>
                  </div>

                  <div className="w-full">
                    <p className="break-words text-sm text-dark sm:text-base">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}

              {product.variants?.map((variant) => (
                <div
                  key={variant.id}
                  className="flex rounded-md px-4 py-4 even:bg-gray-1 sm:px-5"
                >
                  <div className="w-full min-w-[140px] max-w-[450px]">
                    <p className="text-sm text-dark sm:text-base">
                      Variant: {variant.sku}
                    </p>
                  </div>

                  <div className="w-full">
                    <p className="text-sm text-dark sm:text-base">
                      Price: ${variant.price.toFixed(2)} | Stock:{" "}
                      {variant.stockQuantity} |{" "}
                      {variant.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {activeTab === "tabThree" && (
            <div className="mt-12.5 rounded-xl bg-white p-6 shadow-1">
              <h2 className="mb-3 font-medium text-2xl text-dark">
                Product Reviews
              </h2>

              <p className="text-dark-4">
                Reviews are not available yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <RecentlyViewdItems />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
