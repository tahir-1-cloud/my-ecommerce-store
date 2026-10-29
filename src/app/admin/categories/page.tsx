"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  Archive,
  CheckCircle2,
  FolderOpen,
  ImageOff,
  Pencil,
  Plus,
  Trash2,
  ZoomIn,
} from "lucide-react";

import DataGrid from "../components/common/DataGrid";
import Button from "@/app/admin/components/ui/Button";
import IconButton from "../components/ui/IconButton";
import ImagePreviewModal from "@/app/admin/components/ui/ImagePreviewModal";
import CategoryForm from "../components/forms/CategoryForm";
import ConfirmDialog from "@/app/admin/components/ui/ConfirmDialog";

import { notify } from "@/lib/notify";
import { categoryService } from "@/services/categoryService";
import type { Category, CategoryRequest } from "@/types/category";
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(
    null
  );

  const stats = useMemo(() => {
    const active = categories.filter((c) => c.isActive).length;
    return {
      total: categories.length,
      active,
      inactive: categories.length - active,
    };
  }, [categories]);

  const loadCategories = useCallback(async () => {
    setLoading(true);

    try {
      const result = await categoryService.getAll();

      if (!Array.isArray(result)) {
        throw new Error("The categories API did not return a JSON array.");
      }

      setCategories(result);
    } catch (error) {
      notify.error(getMessage(error, "Unable to load categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function openAddForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  // CategoryForm error khud dikhata hai, is liye yahan throw hota hai
  async function handleSave(data: Omit<CategoryRequest, "isActive">) {
    const payload = {
      ...data,
      isActive: editing?.isActive ?? true,
    } as CategoryRequest;

    try {
      if (editing) {
        await categoryService.update(editing.id, payload);
      } else {
        await categoryService.create(payload);
      }
    } catch (error) {
      throw new Error(getMessage(error, "Unable to save category."));
    }

    if (editing) {
      notify.updated("Category updated successfully.");
    } else {
      notify.created("Category created successfully.");
    }

    closeForm();
    await loadCategories();
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    try {
      await categoryService.delete(deleteTarget.id);

      notify.deleted("Category deleted successfully.");
      setDeleteTarget(null);

      await loadCategories();
    } catch (error) {
      notify.error(getMessage(error, "Unable to delete category."));
    } finally {
      setDeleting(false);
    }
  }

  const columnDefs = useMemo<ColDef<Category>[]>(
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
        headerName: "Category Name",
        field: "name",
        minWidth: 200,
        cellClass: "font-semibold text-slate-900",
      },
      {
        headerName: "Status",
        field: "isActive",
        width: 140,
        maxWidth: 150,
        filter: "agTextColumnFilter",
        filterValueGetter: (params) =>
          params.data?.isActive ? "Active" : "Inactive",
        cellRenderer: (params: ICellRendererParams<Category>) => {
          const active = !!params.data?.isActive;

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
        },
      },
      {
        headerName: "Description",
        field: "description",
        minWidth: 240,
        cellClass: "text-slate-500",
        valueFormatter: (params) => params.value || "—",
      },
      {
        headerName: "Image",
        field: "imageUrl",
        width: 110,
        minWidth: 110,
        maxWidth: 120,
        flex: 0,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<Category>) => {
          const category = params.data;
          if (!category) return null;

          if (!category.imageUrl) {
            return (
              <div className="flex h-full items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200">
                  <ImageOff size={18} strokeWidth={1.8} />
                </span>
              </div>
            );
          }

          const src = category.imageUrl;

          return (
            <div className="flex h-full items-center">
              <button
                type="button"
                title="View image"
                aria-label={`View image of ${category.name}`}
                onClick={() => setPreview({ src, title: category.name })}
                className="group relative h-11 w-11 overflow-hidden rounded-lg !p-0 ring-1 ring-slate-200 transition-shadow hover:ring-2 hover:ring-indigo-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn size={16} />
                </span>
              </button>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        colId: "actions",
        width: 120,
        minWidth: 120,
        maxWidth: 140,
        flex: 0,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: ICellRendererParams<Category>) => {
          const category = params.data;
          if (!category) return null;

          return (
            <div className="flex h-full items-center gap-1.5">
              <IconButton
                label={`Edit ${category.name}`}
                tone="primary"
                icon={<Pencil size={16} strokeWidth={1.9} />}
                onClick={() => openEditForm(category)}
              />

              <IconButton
                label={`Delete ${category.name}`}
                tone="danger"
                icon={<Trash2 size={16} strokeWidth={1.9} />}
                onClick={() => setDeleteTarget(category)}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Summary */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Categories"
          value={loading ? "—" : stats.total}
          icon={FolderOpen}
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

      {/* Table card */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All Categories
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Browse, edit and manage your product categories.
            </p>
          </div>

          <Button
            onClick={openAddForm}
            leftIcon={<Plus size={17} strokeWidth={2.5} />}
          >
            Add Category
          </Button>
        </div>

        <div className="p-5 sm:p-6">
          <DataGrid<Category>
            rowData={categories}
            columnDefs={columnDefs}
            loading={loading}
            getRowId={({ data }) => String(data.id)}
            searchPlaceholder="Search categories..."
          />
        </div>
      </section>

      {formOpen && (
        <CategoryForm
          initialData={editing}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}

      {preview && (
        <ImagePreviewModal
          src={preview.src}
          title={preview.title}
          onClose={() => setPreview(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open
          title="Delete Category?"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmText="Delete Category"
          cancelText="Cancel"
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => {
            if (!deleting) setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}