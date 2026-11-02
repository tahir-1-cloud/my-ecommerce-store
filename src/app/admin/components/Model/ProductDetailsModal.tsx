"use client";

import { useState } from "react";
import { AlertCircle, ImageOff, Package, Star } from "lucide-react";

import Modal from "@/app/admin/components/ui/Modal";
import Button from "@/app/admin/components/ui/Button";
import Loader from "@/app/admin/components/ui/Loader";
import type { Product } from "@/types/product";

type ProductDetailsModalProps = {
  product: Product | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
          : "bg-slate-100 text-slate-600 ring-slate-500/15"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {count !== undefined && (
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-100">
          {count}
        </span>
      )}
    </div>
  );
}

function stockClass(stock: number) {
  if (stock <= 0) return "bg-red-50 text-red-700 ring-red-600/15";
  if (stock <= 5) return "bg-amber-50 text-amber-700 ring-amber-600/20";
  return "bg-slate-100 text-slate-700 ring-slate-500/15";
}

function ProductDetailsContent({ product }: { product: Product }) {
  const images = product.images ?? [];
  const variants = product.variants ?? [];
  const categories = product.categories ?? [];

  const primaryIndex = Math.max(
    images.findIndex((image) => image.isPrimary),
    0
  );
  const [activeIndex, setActiveIndex] = useState(primaryIndex);
  const activeImage = images[activeIndex];

  const prices = variants.map((variant) => variant.price);
  const priceText = prices.length
    ? Math.min(...prices) === Math.max(...prices)
      ? Math.min(...prices).toLocaleString()
      : `${Math.min(...prices).toLocaleString()} – ${Math.max(
          ...prices
        ).toLocaleString()}`
    : "—";
  const totalStock = variants.reduce(
    (sum, variant) => sum + (variant.stockQuantity ?? 0),
    0
  );

  return (
    <div className="space-y-7">
      {/* Overview */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Gallery */}
        <div className="md:col-span-2">
          <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage.imageUrl}
                alt={activeImage.altText || product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                <ImageOff size={30} strokeWidth={1.6} />
                <span className="text-sm font-medium">No image</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`aspect-square overflow-hidden rounded-lg !p-0 ring-1 transition-shadow ${
                    index === activeIndex
                      ? "ring-2 ring-indigo-500"
                      : "ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={image.altText || product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge active={product.isActive} />
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                <Star size={12} strokeWidth={2.2} />
                Featured
              </span>
            )}
          </div>

          <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {product.brand || "No brand"}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoTile label="Product ID" value={product.id} />
            <InfoTile label="Slug" value={product.slug || "—"} />
            <InfoTile label="Price" value={priceText} />
            <InfoTile label="Total Stock" value={totalStock.toLocaleString()} />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {product.description || "No description available."}
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <SectionTitle title="Categories" count={categories.length} />
        {categories.length ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-100"
              >
                {category.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No categories assigned.</p>
        )}
      </section>

      {/* Variants */}
      <section>
        <SectionTitle title="Variants" count={variants.length} />
        {variants.length ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Compare Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {variant.sku}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {variant.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {variant.compareAtPrice != null
                        ? variant.compareAtPrice.toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${stockClass(
                          variant.stockQuantity
                        )}`}
                      >
                        {variant.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={variant.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No variants available.
          </p>
        )}
      </section>
    </div>
  );
}

export default function ProductDetailsModal({
  product,
  loading,
  error,
  onClose,
}: ProductDetailsModalProps) {
  return (
    <Modal
      title="Product Details"
      description="View complete product information."
      icon={<Package size={19} strokeWidth={1.9} />}
      size="xl"
      onClose={onClose}
      closeDisabled={loading}
    >
      <div className="p-6">
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader size="md" />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        ) : product ? (
          <ProductDetailsContent key={product.id} product={product} />
        ) : null}
      </div>

      <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Close
        </Button>
      </div>
    </Modal>
  );
}