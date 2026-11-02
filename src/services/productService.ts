import { apiRequest } from "@/lib/apiclient";

import type {
  Product,
  ProductRequest,
} from "@/types/product";

const endpoint = "products";

/**
 * Converts product data into multipart/form-data.
 */
const toFormData = (data: ProductRequest): FormData => {
  const formData = new FormData();

  // Basic information
  formData.append("Name", data.name);
  formData.append("Description", data.description ?? "");
  formData.append("Brand", data.brand ?? "");
  formData.append("IsActive", String(data.isActive));
  formData.append("IsFeatured", String(data.isFeatured));

  // Categories
  data.categoryIds.forEach((categoryId, index) => {
    formData.append(
      `CategoryIds[${index}]`,
      String(categoryId)
    );
  });

  // Product variants
  data.variants.forEach((variant, index) => {
    formData.append(
      `Variants[${index}].SKU`,
      variant.sku
    );

    formData.append(
      `Variants[${index}].Price`,
      String(variant.price)
    );

    if (variant.compareAtPrice !== null) {
      formData.append(
        `Variants[${index}].CompareAtPrice`,
        String(variant.compareAtPrice)
      );
    }

    formData.append(
      `Variants[${index}].StockQuantity`,
      String(variant.stockQuantity)
    );

    formData.append(
      `Variants[${index}].IsActive`,
      String(variant.isActive)
    );
  });

  // Product images
  data.images.forEach((image) => {
    formData.append("Images", image);
  });

  return formData;
};

export const productService = {
  /**
   * Get all products.
   */
  getAll: (): Promise<Product[]> =>
    apiRequest<Product[]>(endpoint),

  /**
   * Get product by ID.
   */
  getById: (id: number): Promise<Product> =>
    apiRequest<Product>(`${endpoint}/${id}`),

  /**
   * Create product.
   */
  create: (data: ProductRequest): Promise<Product> =>
    apiRequest<Product>(endpoint, {
      method: "POST",
      body: toFormData(data),
    }),

  /**
   * Update product.
   */
  update: (
    id: number,
    data: ProductRequest
  ): Promise<Product> =>
    apiRequest<Product>(`${endpoint}/${id}`, {
      method: "PUT",
      body: toFormData(data),
    }),

  /**
   * Delete product.
   */
  delete: (id: number): Promise<void> =>
    apiRequest<void>(`${endpoint}/${id}`, {
      method: "DELETE",
    }),
};