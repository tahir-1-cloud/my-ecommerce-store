import type { Product, ProductVariant } from "@/types/product";

export const getProductImage = (item: Product): string | null =>
  item.images?.find((image) => image.isPrimary)?.imageUrl ||
  item.images?.[0]?.imageUrl ||
  null;


export const getProductVariant = (item: Product): ProductVariant | null =>
  item.variants?.find(
    (variant) => variant.isActive && variant.stockQuantity > 0
  ) ?? null;


export const getPriceInfo = (item: Product) => {
  const variant = getProductVariant(item);
  const price = variant?.price ?? null;
  const compare = variant?.compareAtPrice ?? null;

  return {
    price,
    oldPrice: price !== null && compare !== null && compare > price ? compare : null,
  };
};

export const isInStock = (item: Product): boolean =>
  item.variants?.some((variant) => variant.isActive && variant.stockQuantity > 0) ?? false;

export const formatPrice = (value: number | null): string =>
  value === null
    ? "—"
    : `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;

/**
 * Redux slices (cart, wishlist, quickView) abhi purani shape (title, price,
 * discountedPrice, imgs) expect karte hain. Ye helper real data se wahi
 * fields banata hai. Slices ko Product par migrate karo to ye hata dena.
 */


export const toStoreItem = (item: Product) => {
  const variant = getProductVariant(item);
  const image = getProductImage(item);

  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice ?? null;

  const oldPrice =
    compare !== null && compare > price ? compare : null;

  return {
    ...item,
    title: item.name,
    productVariantId: variant?.id ?? 0,
    price: oldPrice ?? price,
    discountedPrice: price,
    quantity: 1,
    reviews: 0,
    imgs: {
      thumbnails: image ? [image] : [],
      previews: image ? [image] : [],
    },
  };
};

