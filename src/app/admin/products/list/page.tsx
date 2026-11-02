"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  Eye,
  Package,
  Plus,
} from "lucide-react";

import DataGrid from "../../components/common/DataGrid";
import IconButton from "../../components/ui/IconButton";
import Button from "@/app/admin/components/ui/Button";
import ProductDetailsModal from "@/app/admin/components/Model/ProductDetailsModal";

import { notify } from "@/lib/notify";
import { productService } from "@/services/productService";
import type { Product, ProductVariant } from "@/types/product";
import { ApiError } from "@/lib/apierror";

const getMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : fallback;

type StatTone = "indigo" | "emerald" | "slate";

const statTones: Record<StatTone, string> = {
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  tone: StatTone;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${statTones[tone]}`}
      >
        <Icon size={22} strokeWidth={1.9} />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center">
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
    </div>
  );
}

function getStartingPrice(variants: ProductVariant[]) {
  if (!variants?.length) return "—";

  const prices = variants.map((variant) => variant.price);
  return Math.min(...prices).toLocaleString();
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.isActive).length;

    return {
      total: products.length,
      active,
      inactive: products.length - active,
    };
  }, [products]);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const result = await productService.getAll();

      if (!Array.isArray(result)) {
        throw new Error("The products API did not return a JSON array.");
      }

      setProducts(result);
    } catch (error) {
      notify.error(getMessage(error, "Unable to load products."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const openDetails = useCallback(async (product: Product) => {
    setDetailsOpen(true);
    setSelectedProduct(null);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const result = await productService.getById(product.id);
      setSelectedProduct(result);
    } catch (error) {
      const message = getMessage(error, "Unable to load product details.");
      setDetailsError(message);
      notify.error(message);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  function closeDetails() {
    if (detailsLoading) return;

    setDetailsOpen(false);
    setSelectedProduct(null);
    setDetailsError(null);
  }

  const columnDefs = useMemo<ColDef<Product>[]>(
    () => [
      {
        headerName: "ID",
        field: "id",
        width: 90,
        minWidth: 80,
        maxWidth: 100,
        flex: 0,
        filter: "agNumberColumnFilter",
        cellClass: "font-medium text-slate-500",
      },
      {
        headerName: "Product Name",
        field: "name",
        minWidth: 200,
        cellClass: "font-semibold text-slate-900",
      },
      {
        headerName: "Brand",
        field: "brand",
        minWidth: 130,
        cellClass: "text-slate-600",
        valueFormatter: (params) => params.value || "—",
      },
      {
        headerName: "Categories",
        colId: "categories",
        minWidth: 190,
        valueGetter: (params) =>
          params.data?.categories?.map((category) => category.name).join(", ") ||
          "—",
        cellClass: "text-slate-600",
      },
      {
        headerName: "Starting Price",
        colId: "startingPrice",
        minWidth: 140,
        valueGetter: (params) => getStartingPrice(params.data?.variants ?? []),
        cellClass: "font-medium text-slate-700",
      },
      {
        headerName: "Status",
        field: "isActive",
        width: 130,
        minWidth: 120,
        maxWidth: 140,
        flex: 0,
        filter: "agTextColumnFilter",
        filterValueGetter: (params) =>
          params.data?.isActive ? "Active" : "Inactive",
        cellRenderer: (params: ICellRendererParams<Product>) => (
          <StatusBadge active={!!params.data?.isActive} />
        ),
      },
      {
        headerName: "Actions",
        colId: "actions",
        width: 90,
        minWidth: 90,
        maxWidth: 100,
        flex: 0,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: ICellRendererParams<Product>) => {
          const product = params.data;
          if (!product) return null;

          return (
            <div className="flex h-full items-center">
              <IconButton
                label={`View ${product.name}`}
                tone="primary"
                icon={<Eye size={16} strokeWidth={1.9} />}
                onClick={() => void openDetails(product)}
              />
            </div>
          );
        },
      },
    ],
    [openDetails]
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Summary */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Products"
          value={loading ? "—" : stats.total}
          icon={Package}
          tone="indigo"
        />
        <StatCard
          label="Active"
          value={loading ? "—" : stats.active}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Inactive"
          value={loading ? "—" : stats.inactive}
          icon={Archive}
          tone="slate"
        />
      </section>

      {/* Products table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All Products
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Browse products and view their details.
            </p>
          </div>

        <Button
            onClick={() => router.push("/admin/products/add")}
            leftIcon={<Plus size={17} strokeWidth={2.5} />}
            >
            Add Product
            </Button>
        </div>

        <div className="p-5 sm:p-6">
          <DataGrid<Product>
            rowData={products}
            columnDefs={columnDefs}
            loading={loading}
            getRowId={({ data }) => String(data.id)}
            searchPlaceholder="Search products..."
          />
        </div>
      </section>

      {detailsOpen && (
        <ProductDetailsModal
          product={selectedProduct}
          loading={detailsLoading}
          error={detailsError}
          onClose={closeDetails}
        />
      )}
    </div>
  );
}