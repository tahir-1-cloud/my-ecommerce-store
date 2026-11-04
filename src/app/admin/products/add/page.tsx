"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Images,
  Layers,
  Package,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import Button from "@/app/admin/components/ui/Button";
import IconButton from "@/app/admin/components/ui/IconButton";
import Loader from "@/app/admin/components/ui/Loader";
import {
  Checkbox,
  FieldError,
  Input,
  Textarea,
} from "@/app/admin/components/ui/Field";
import ImageUpload from "@/app/admin/components/ui/ImageUpload";
import MultiSelect from "@/app/admin/components/ui/MultiSelect";
import SectionCard from "@/app/admin/components/ui/SectionCard";
import SwitchField from "@/app/admin/components/ui/SwitchField";

import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { validateProduct, validateVariants } from "@/lib/validations/product";
import type { FieldErrors } from "@/lib/validations/product";

import type { Category } from "@/types/category";
import type {
  ProductRequest,
  ProductVariantRequest,
} from "@/types/product";

import { ApiError } from "@/lib/apierror";
import { notify } from "@/lib/notify";

type VariantForm = ProductVariantRequest & {
  id: number;
};

// none: koi error nahi | variants: sirf variants | all: poora form
type ValidationMode = "none" | "variants" | "all";

const createVariant = (): VariantForm => ({
  id: Date.now() + Math.random(),
  sku: "",
  price: 0,
  compareAtPrice: null,
  stockQuantity: 0,
  isActive: true,
});

const focusFirstError = () => {
  window.setTimeout(() => {
    const element = document.querySelector<HTMLElement>(
      '[aria-invalid="true"]'
    );
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.focus({ preventScroll: true });
  }, 60);
};

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<ValidationMode>("none");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [variants, setVariants] = useState<VariantForm[]>([createVariant()]);

  const [images, setImages] = useState<(File | null)[]>([null]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll();

        if (!Array.isArray(response)) {
          throw new Error("Invalid categories response.");
        }

        setCategories(response);
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Failed to load categories.";

        notify.error(message);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Errors live update hote hain: type karte hi theek field ka red hat jata hai
  const errors = useMemo<FieldErrors>(() => {
    if (mode === "all") {
      return validateProduct({
        name,
        brand,
        description,
        categoryIds,
        variants,
      });
    }
    if (mode === "variants") return validateVariants(variants);

    return {};
  }, [mode, name, brand, description, categoryIds, variants]);


  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories]
  );

  const updateVariant = (
    id: number,
    field: keyof ProductVariantRequest,
    value: string | number | boolean | null
  ) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  // Naya variant tabhi judta hai jab pehle wale sab valid hon
  const addVariant = () => {
    const found = validateVariants(variants);

    if (Object.keys(found).length > 0) {
      setMode((current) => (current === "all" ? "all" : "variants"));
      notify.warning(
        "Complete the current variant first",
        "Fill in SKU, price and stock before adding another variant."
      );
      focusFirstError();
      return;
    }

    setVariants((current) => [...current, createVariant()]);
  };

  const removeVariant = (id: number) => {
    setVariants((current) =>
      current.length > 1
        ? current.filter((variant) => variant.id !== id)
        : current
    );
  };

  const updateImage = (index: number, file: File | null) => {
    setImages((current) => {
      const updated = [...current];
      updated[index] = file;

      if (file && index === current.length - 1) {
        updated.push(null);
      }

      return updated;
    });
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const updated = current.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [null];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setMode("all");

    const found = validateProduct({
      name,
      brand,
      description,
      categoryIds,
      variants,
    });

    if (Object.keys(found).length > 0) {
      notify.error("Please fix the highlighted fields.");
      focusFirstError();
      return;
    }

    const productData: ProductRequest = {
      name: name.trim(),
      brand: brand.trim() || null,
      description: description.trim() || null,
      isActive,
      isFeatured,
      categoryIds,
      variants: variants.map(({ id, ...variant }) => variant),
      images: images.filter((file): file is File => file !== null),
    };

    try {
      setSubmitting(true);

      await productService.create(productData);

      notify.created("Product created successfully.");
      router.push("/admin/products/list");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to create product.";

      notify.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategories) {
    return <Loader className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6 font-sans antialiased">
      {/* Toolbar (page title header mein already hai) */}
      <div className="flex items-center gap-3">
       
        <div>
          <p className="text-sm font-semibold text-slate-900">Add Product</p>
          <p className="text-sm text-slate-500">
            Create a new product for your store.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Basic Information */}
        <SectionCard
          icon={Package}
          title="Basic Information"
          description="Enter the main details of your product."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Product Name"
              placeholder="Enter product name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={200}
              error={errors.name}
              disabled={submitting}
            />

            <Input
              label="Brand"
              placeholder="Enter brand name"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              maxLength={150}
              optional
              error={errors.brand}
              disabled={submitting}
            />

            <div className="md:col-span-2">
              <MultiSelect<number>
                label="Categories"
                required
                placeholder="Select categories"
                emptyText="No categories available."
                options={categoryOptions}
                value={categoryIds}
                onChange={setCategoryIds}
                error={errors.categoryIds}
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Description"
                placeholder="Enter product description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                maxLength={5000}
                optional
                error={errors.description}
                disabled={submitting}
              />
            </div>
          </div>
        </SectionCard>

        {/* Product Variants */}
        <SectionCard
          icon={Layers}
          title="Product Variants"
          description="Add SKU, pricing and stock information."
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={addVariant}
              disabled={submitting}
              leftIcon={<Plus size={16} strokeWidth={2.5} />}
            >
              Add Variant
            </Button>
          }
        >
          <div className="space-y-4">
            {errors.variants && <FieldError message={errors.variants} />}

            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 ring-1 ring-inset ring-indigo-100">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Variant {index + 1}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <Checkbox
                      label="Active"
                      checked={variant.isActive}
                      disabled={submitting}
                      onChange={(event) =>
                        updateVariant(
                          variant.id,
                          "isActive",
                          event.target.checked
                        )
                      }
                    />

                    <IconButton
                      label={`Remove variant ${index + 1}`}
                      tone="danger"
                      size="sm"
                      icon={<Trash2 size={15} strokeWidth={1.9} />}
                      onClick={() => removeVariant(variant.id)}
                      disabled={variants.length === 1 || submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <Input
                    label="SKU"
                    placeholder="Enter SKU"
                    value={variant.sku}
                    onChange={(event) =>
                      updateVariant(variant.id, "sku", event.target.value)
                    }
                    required
                    maxLength={100}
                    error={errors[`variants.${index}.sku`]}
                    disabled={submitting}
                  />

                  <Input
                    label="Price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.price || ""}
                    onChange={(event) =>
                      updateVariant(
                        variant.id,
                        "price",
                        Number(event.target.value)
                      )
                    }
                    required
                    error={errors[`variants.${index}.price`]}
                    disabled={submitting}
                  />

                  <Input
                    label="Compare At Price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.compareAtPrice ?? ""}
                    onChange={(event) =>
                      updateVariant(
                        variant.id,
                        "compareAtPrice",
                        event.target.value === ""
                          ? null
                          : Number(event.target.value)
                      )
                    }
                    optional
                    error={errors[`variants.${index}.compareAtPrice`]}
                    disabled={submitting}
                  />

                  <Input
                    label="Stock Quantity"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={variant.stockQuantity}
                    onChange={(event) =>
                      updateVariant(
                        variant.id,
                        "stockQuantity",
                        Number(event.target.value)
                      )
                    }
                    required
                    error={errors[`variants.${index}.stockQuantity`]}
                    disabled={submitting}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Product Images */}
        <SectionCard
          icon={Images}
          title="Product Images"
          description="Upload one or more images (JPG, PNG or WEBP, max 2MB each)."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((file, index) => (
              <ImageUpload
                key={index}
                label={`Product Image ${index + 1}`}
                optional
                file={file}
                existingUrl={null}
                onSelect={(selectedFile) => updateImage(index, selectedFile)}
                onRemove={() => removeImage(index)}
                onError={(message) => notify.error(message)}
                disabled={submitting}
              />
            ))}
          </div>
        </SectionCard>

        {/* Product Settings */}
        <SectionCard
          icon={SlidersHorizontal}
          title="Product Settings"
          description="Configure product visibility and featured status."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SwitchField
              label="Active Product"
              description="Make this product available in your store."
              checked={isActive}
              onChange={setIsActive}
              disabled={submitting}
            />

            <SwitchField
              label="Featured Product"
              description="Highlight this product in your store."
              checked={isFeatured}
              onChange={setIsFeatured}
              disabled={submitting}
            />
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => router.push("/admin/products/list")}
          >
            Cancel
          </Button>

          <Button type="submit" loading={submitting}>
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}