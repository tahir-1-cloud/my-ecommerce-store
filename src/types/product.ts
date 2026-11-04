
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  isActive: boolean;
  createdAt: string;
  isFeatured: boolean;
  categoryIds: number[];
  categories: ProductCategory[];
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductVariantRequest {
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductRequest {
  name: string;
  description?: string | null;
  brand?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryIds: number[];
  variants: ProductVariantRequest[];
  images: File[];
}