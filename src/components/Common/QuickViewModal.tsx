"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useAppSelector } from "@/redux/store";
import { useAddToCart } from "@/hooks/useAddToCart";
import { productService } from "@/services/productService";

import type { Product } from "@/types/product";

const QuickViewModal = () => {
  const router = useRouter();

  const { isModalOpen, closeModal } = useModalContext();

  const quickViewProduct = useAppSelector(
    (state) => state.quickViewReducer.value
  );

  const { handleAddToCart, isInCart } = useAddToCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );

  // Load complete product details from backend.
  useEffect(() => {
    if (!isModalOpen || !quickViewProduct?.id) return;

    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        const response = await productService.getById(
          Number(quickViewProduct.id)
        );

        if (isMounted) {
          setProduct(response);

          const variants = response.variants ?? [];

          const availableVariant =
            variants.find(
              (variant) => variant.isActive && variant.stockQuantity > 0
            ) ?? variants.find((variant) => variant.isActive);

          setSelectedVariantId(availableVariant?.id ?? null);
          setQuantity(1);
          setActiveImage(0);
        }
      } catch (err) {
        console.error("Failed to load product details:", err);

        if (isMounted) {
          setError("Unable to load product details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [isModalOpen, quickViewProduct?.id]);

  // Close modal on outside click.
  useEffect(() => {
    if (!isModalOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest(".quick-view-content")
      ) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, closeModal]);

  // Escape se close + background scroll lock.
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isModalOpen, closeModal]);

  // Active variants.
  const activeVariants = useMemo(
    () => product?.variants?.filter((variant) => variant.isActive) ?? [],
    [product]
  );

  const selectedVariant = useMemo(
    () =>
      activeVariants.find((variant) => variant.id === selectedVariantId) ??
      null,
    [activeVariants, selectedVariantId]
  );

  // Product images.
  const images = useMemo(
    () =>
      [...(product?.images ?? [])]
        .filter((image) => !!image.imageUrl)
        .sort((a, b) => {
          if (a.isPrimary !== b.isPrimary) {
            return a.isPrimary ? -1 : 1;
          }

          return a.sortOrder - b.sortOrder;
        }),
    [product]
  );

  const currentImage = images[activeImage]?.imageUrl;

  // Price and stock.
  const price = Number(selectedVariant?.price ?? 0);
  const compareAtPrice = Number(selectedVariant?.compareAtPrice ?? 0);
  const hasDiscount = compareAtPrice > price && price > 0;
  const stock = selectedVariant?.stockQuantity ?? 0;

  const isAvailable =
    !!product?.isActive && !!selectedVariant?.isActive && stock > 0;

  const maxQuantity = Math.max(0, stock);
  const totalPrice = price * quantity;

  const discountPercentage = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const alreadyInCart = product ? isInCart(product.id) : false;

  // Change variant.
  const handleVariantChange = (variantId: number) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  // Add to cart.
  const handleAdd = () => {
    if (!product || !isAvailable) return;

    if (quantity < 1 || quantity > stock) return;

    handleAddToCart({
      id: product.id,
      title: product.name,
      price: hasDiscount ? compareAtPrice : price,
      discountedPrice: price,
      quantity: quantity,
      imgs: {
        thumbnails: images.map((image) => image.imageUrl),
        previews: images.map((image) => image.imageUrl),
      },
    });
  };

  // Add to cart and proceed to checkout.
 const handleProceedToCheckout = () => {
  if (!product || !isAvailable) return;

  if (quantity < 1 || quantity > stock) return;

  closeModal();

  router.push(
    `/checkout?mode=buy-now&productId=${product.id}&variantId=${selectedVariantId}&quantity=${quantity}`
  );
};

  const handleClose = () => {
    closeModal();
    setQuantity(1);
    setActiveImage(0);
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-dark/60 backdrop-blur-sm sm:items-center sm:px-6 sm:py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick view"
        className="quick-view-content relative flex max-h-[94vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-t-2xl bg-white shadow-3 sm:max-h-[90vh] sm:rounded-2xl"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close modal"
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark shadow-1 ring-1 ring-gray-3 duration-200 ease-out hover:bg-dark hover:text-white hover:ring-dark sm:right-4 sm:top-4"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6L18 18M18 6L6 18" />
          </svg>
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-3 border-t-blue" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v6M12 16.5v.01" />
              </svg>
            </span>
            <p className="text-red">{error}</p>

            <button
              onClick={handleClose}
              className="mt-6 rounded-md bg-blue px-6 py-3 font-medium text-white duration-200 ease-out hover:bg-blue-dark"
            >
              Close
            </button>
          </div>
        )}

        {/* Product Details */}
        {!loading && !error && product && (
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
            {/* Images */}
            <div className="bg-[#F6F7FB] p-5 pt-16 sm:p-7 sm:pt-16 lg:overflow-y-auto lg:pt-7">
              <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-xl bg-white shadow-1">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 460px, 90vw"
                    priority
                    unoptimized
                    className="object-contain p-5"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-gray-4">
                    <svg
                      width="55"
                      height="55"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15L16 10L5 21" />
                    </svg>
                    <span className="mt-2 text-sm">No image available</span>
                  </div>
                )}

                {hasDiscount && (
                  <span className="absolute left-3 top-3 rounded-full bg-green px-3 py-1 text-xs font-medium text-white shadow-1">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mx-auto mt-4 flex max-w-[460px] gap-3 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      aria-label={`Show image ${index + 1}`}
                      onClick={() => setActiveImage(index)}
                      className={`relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-lg bg-white duration-200 ease-out ${
                        activeImage === index
                          ? "ring-2 ring-blue"
                          : "ring-1 ring-gray-3 hover:ring-gray-4"
                      }`}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={image.altText || product.name}
                        fill
                        sizes="70px"
                        unoptimized
                        className="object-contain p-1.5"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="flex min-h-0 flex-col lg:overflow-hidden">
              <div className="flex-1 p-5 sm:p-7 lg:overflow-y-auto lg:pr-8 lg:pt-12">
                {/* Categories */}
                {product.categories?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Brand */}
                {product.brand && (
                  <p className="mb-1.5 text-sm font-medium uppercase tracking-wide text-dark-4">
                    {product.brand}
                  </p>
                )}

                {/* Product Name */}
                <h2 className="mb-3 text-2xl font-semibold text-dark xl:text-heading-5">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-semibold text-dark">
                    ${price.toFixed(2)}
                  </span>

                  {hasDiscount && (
                    <span className="text-lg text-dark-4 line-through">
                      ${compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock */}
                <div
                  className={`mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                    isAvailable
                      ? "bg-green/10 text-green"
                      : "bg-red/10 text-red"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAvailable ? "bg-green" : "bg-red"
                    }`}
                  />
                  {isAvailable ? `${stock} items available` : "Out of stock"}
                </div>

                {/* Description */}
                <p className="mb-6 line-clamp-4 text-sm leading-7 text-dark-4">
                  {product.description || "No description available."}
                </p>

                {/* Variant Selection */}
                {activeVariants.length > 1 && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-sm font-medium text-dark">
                      Select Variant
                    </h4>

                    <div className="flex flex-wrap gap-2.5">
                      {activeVariants.map((variant) => {
                        const selected = variant.id === selectedVariantId;
                        const soldOut = variant.stockQuantity <= 0;

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => handleVariantChange(variant.id)}
                            aria-pressed={selected}
                            className={`rounded-lg border px-4 py-2 text-left text-sm duration-200 ease-out ${
                              selected
                                ? "border-blue bg-blue/10 text-blue"
                                : "border-gray-3 bg-white text-dark hover:border-blue"
                            } ${soldOut ? "opacity-60" : ""}`}
                          >
                            <span className="block font-medium">
                              {variant.sku}
                            </span>
                            <span className="block text-xs">
                              ${Number(variant.price).toFixed(2)}
                              {soldOut ? " · Out of stock" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-2">
                  <h4 className="mb-3 text-sm font-medium text-dark">
                    Quantity
                  </h4>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-lg border border-gray-3 bg-white">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1 || !isAvailable}
                        onClick={() =>
                          setQuantity((current) => Math.max(1, current - 1))
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-l-lg text-lg text-dark duration-200 ease-out hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>

                      <span className="flex h-11 w-14 items-center justify-center border-x border-gray-3 font-medium text-dark">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={!isAvailable || quantity >= maxQuantity}
                        onClick={() =>
                          setQuantity((current) =>
                            Math.min(maxQuantity, current + 1)
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-r-lg text-lg text-dark duration-200 ease-out hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs text-dark-4">
                      Max: {maxQuantity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: total + actions (mobile par sticky) */}
              <div className="sticky bottom-0 border-t border-gray-3 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7 lg:static">
                {/* Total */}
                <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-1 px-4 py-3">
                  <span className="text-sm font-medium text-dark-4">
                    Total Price
                  </span>
                  <span className="text-xl font-semibold text-blue">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!isAvailable || alreadyInCart}
                    className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium whitespace-nowrap duration-200 ease-out ${
                      alreadyInCart
                        ? "cursor-default bg-[#16a34a] text-white"
                        : "bg-blue text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-4"
                    }`}
                  >
                    {!alreadyInCart && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 4h2l2.2 10.2a1.5 1.5 0 001.5 1.2h8.1a1.5 1.5 0 001.5-1.1L20 8H6.2" />
                        <circle cx="9" cy="19.5" r="1.3" fill="currentColor" />
                        <circle cx="17" cy="19.5" r="1.3" fill="currentColor" />
                      </svg>
                    )}
                    {alreadyInCart ? "✓ Added to Cart" : "Add to Cart"}
                  </button>

                  {/* Proceed to Checkout */}
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    disabled={!isAvailable || quantity < 1 || quantity > stock}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-dark px-4 text-sm font-medium whitespace-nowrap text-white duration-200 ease-out hover:bg-blue disabled:cursor-not-allowed disabled:bg-gray-4"
                  >
                    Buy Now
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>

                {!isAvailable && (
                  <p className="mt-3 text-center text-sm text-red">
                    This product is currently unavailable.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickViewModal;