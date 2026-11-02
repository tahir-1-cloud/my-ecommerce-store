import { z } from "zod";

/* ---------- Types ---------- */

/** Key path hota hai, jaise "name" ya "variants.0.sku" */
export type FieldErrors = Record<string, string>;

/* ---------- Schemas ---------- */

export const variantSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(100, "SKU must be 100 characters or less"),
  price: z.number().gt(0, "Price must be greater than 0"),
  compareAtPrice: z
    .number()
    .min(0, "Compare price cannot be negative")
    .nullable(),
  stockQuantity: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  isActive: z.boolean(),
});

export const variantsSchema = z
  .array(variantSchema)
  .min(1, "Add at least one variant")
  .superRefine((variants, ctx) => {
    const seen = new Set<string>();

    variants.forEach((variant, index) => {
      const key = variant.sku.trim().toLowerCase();
      if (!key) return;

      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate SKU. Each variant needs a unique SKU",
          path: [index, "sku"],
        });
      } else {
        seen.add(key);
      }
    });
  });

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(200, "Product name must be 200 characters or less"),
  brand: z.string().trim().max(150, "Brand must be 150 characters or less"),
  description: z
    .string()
    .trim()
    .max(5000, "Description must be 5000 characters or less"),
  categoryIds: z.array(z.number()).min(1, "Select at least one category"),
  variants: variantsSchema,
});

export type ProductFormValues = z.infer<typeof productSchema>;

/* ---------- Helpers ---------- */

function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (!(key in errors)) errors[key] = issue.message;
  }

  return errors;
}

/** Poora product form validate karta hai. Khali object = sab theek. */
export function validateProduct(values: unknown): FieldErrors {
  const result = productSchema.safeParse(values);
  return result.success ? {} : toFieldErrors(result.error);
}

/** Sirf variants validate karta hai. Keys: "variants.0.sku" */
export function validateVariants(variants: unknown): FieldErrors {
  const result = z.object({ variants: variantsSchema }).safeParse({ variants });
  return result.success ? {} : toFieldErrors(result.error);
}