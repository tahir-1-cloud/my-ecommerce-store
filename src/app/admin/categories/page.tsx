"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  AlertCircle,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import DataGrid from "../components/common/DataGrid";
import Button from "@/app/admin/components/ui/Button";
import IconButton from "../components/ui/IconButton";
import CategoryForm from "../components/forms/CategoryForm";

import {
  categoryService,
  type Category,
  type CategoryRequest,
} from "@/services/categoryService";
import { ApiError } from "@/lib/apierror";

const getMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : fallback;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const result = await categoryService.getAll();

      if (!Array.isArray(result)) {
        throw new Error("The categories API did not return a JSON array.");
      }

      setCategories(result);
    } catch (error) {
      setPageError(getMessage(error, "Unable to load categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function openAddForm() {
    setEditing(null);
    setPageError("");
    setFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditing(category);
    setPageError("");
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

    closeForm();
    await loadCategories();
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    setPageError("");

    try {
      await categoryService.delete(category.id);
      await loadCategories();
    } catch (error) {
      setPageError(getMessage(error, "Unable to delete category."));
    }
  }

  const columnDefs = useMemo<ColDef<Category>[]>(
    () => [
      {
        headerName: "ID",
        field: "id",
        maxWidth: 90,
        filter: "agNumberColumnFilter",
        cellClass: "font-medium text-slate-500",
      },
      {
        headerName: "Category",
        field: "name",
        minWidth: 220,
        cellRenderer: (params: ICellRendererParams<Category>) => {
          const category = params.data;
          if (!category) return null;

          return (
            <div className="flex h-full items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                <FolderOpen size={17} strokeWidth={1.9} />
              </div>
              <span className="truncate font-semibold text-slate-900">
                {category.name}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Slug",
        field: "slug",
        minWidth: 160,
        cellClass: "text-slate-500",
      },
      {
        headerName: "Description",
        field: "description",
        minWidth: 220,
        cellClass: "text-slate-500",
        valueFormatter: (params) => params.value || "—",
      },
      {
        headerName: "Status",
        field: "isActive",
        maxWidth: 140,
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
        headerName: "Actions",
        colId: "actions",
        sortable: false,
        filter: false,
        resizable: false,
        minWidth: 120,
        maxWidth: 130,
        flex: 0,
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
                onClick={() => void handleDelete(category)}
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-slate-500">
          Manage your product categories.
        </p>

        <Button
          onClick={openAddForm}
          leftIcon={<Plus size={17} strokeWidth={2.5} />}
        >
          Add Category
        </Button>
      </div>

      {pageError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          <span className="flex items-start gap-2.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {pageError}
          </span>
          <IconButton
            label="Dismiss error"
            icon={<X size={17} />}
            onClick={() => setPageError("")}
            className="h-7 w-7 text-red-500 hover:bg-red-100 hover:text-red-700"
          />
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All Categories
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Browse, edit and manage your categories.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-100">
            {categories.length} total
          </span>
        </div>

        <DataGrid<Category>
          rowData={categories}
          columnDefs={columnDefs}
          loading={loading}
          getRowId={({ data }) => String(data.id)}
          searchPlaceholder="Search categories..."
        />
      </section>

      {formOpen && (
        <CategoryForm
          initialData={editing}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}