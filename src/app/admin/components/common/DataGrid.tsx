"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import type {
  ColDef,
  GetRowIdParams,
  GridOptions,
} from "ag-grid-community";
import { Search, X } from "lucide-react";

import Loader from "../ui/Loader";

ModuleRegistry.registerModules([AllCommunityModule]);

const adminTheme = themeQuartz.withParams({
  // Brand
  accentColor: "#4f46e5",
  fontFamily: "inherit",

  // Surfaces
  backgroundColor: "#ffffff",
  foregroundColor: "#334155",
  borderColor: "#e2e8f0",
  wrapperBorder: { color: "#e2e8f0", width: 1, style: "solid" },
  wrapperBorderRadius: 14,
  borderRadius: 8,

  // Header (sidebar jaisa deep indigo)
  headerBackgroundColor: "#252268",
  headerTextColor: "#ffffff",
  headerFontSize: 12,
  headerFontWeight: 600,
  headerHeight: 48,
  headerColumnBorder: { color: "rgba(255,255,255,0.08)", width: 1 },
  headerColumnResizeHandleColor: "#6366f1",
  headerColumnResizeHandleHeight: "40%",
  headerCellHoverBackgroundColor: "#2f2c8c",
  iconButtonHoverBackgroundColor: "rgba(255,255,255,0.12)",

  // Rows
  oddRowBackgroundColor: "#ffffff",
  rowHoverColor: "#eef2ff",
  selectedRowBackgroundColor: "#e0e7ff",
  rowBorder: { color: "#f1f5f9", width: 1, style: "solid" },
  rowHeight: 64,
  fontSize: 14,
  cellHorizontalPadding: 20,

  // Inputs / filter popups
  inputFocusBorder: { color: "#6366f1" },
  inputFocusShadow: { color: "rgba(99,102,241,0.15)", radius: 4 },
  menuBackgroundColor: "#ffffff",
  menuBorder: { color: "#e2e8f0", width: 1, style: "solid" },
  menuShadow: {
    color: "rgba(15,23,42,0.16)",
    radius: 24,
    offsetY: 12,
  },

  // Pagination footer
  // Pagination footer
  footerRowBorder: { color: "#e2e8f0", width: 1, style: "solid" },
});

type DataGridProps<T> = {
  rowData: T[];
  columnDefs: ColDef<T>[];
  loading?: boolean;
  getRowId?: (params: GetRowIdParams<T>) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  gridOptions?: GridOptions<T>;
};

export default function DataGrid<T>({
  rowData,
  columnDefs,
  loading = false,
  getRowId,
  searchPlaceholder = "Search...",
  pageSize = 10,
  gridOptions,
}: DataGridProps<T>) {
  const [quickFilter, setQuickFilter] = useState("");

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 120,
      suppressMovable: true,
    }),
    []
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={quickFilter}
            onChange={(event) => setQuickFilter(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 w-full rounded-xl !border !border-slate-200 !bg-slate-50 pl-10 pr-10 text-sm !text-slate-900 !outline-none transition-colors duration-150 placeholder:text-slate-400 hover:!border-slate-300 focus:!border-indigo-500 focus:!bg-white focus:ring-4 focus:ring-indigo-500/15"
          />
          {quickFilter && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuickFilter("")}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md !bg-transparent !text-slate-400 transition-colors hover:!bg-slate-200 hover:!text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!loading && (
          <p className="text-sm font-medium text-slate-500">
            <span className="font-semibold text-slate-900">
              {rowData.length}
            </span>{" "}
            {rowData.length === 1 ? "record" : "records"}
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="relative">
        <div className={loading ? "min-h-[360px]" : ""}>
          <AgGridReact<T>
            theme={adminTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowId={getRowId}
            quickFilterText={quickFilter}
            pagination
            paginationPageSize={pageSize}
            paginationPageSizeSelector={[10, 25, 50]}
            domLayout="autoHeight"
            suppressCellFocus
            suppressNoRowsOverlay={loading}
            overlayNoRowsTemplate='<span style="color:#64748b;font-size:14px;font-weight:500">No records found.</span>'
            {...gridOptions}
          />
        </div>

        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[14px] bg-white/85">
            <Loader size="md" />
          </div>
        )}
      </div>
    </div>
  );
}