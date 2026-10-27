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
import { Search } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

const adminTheme = themeQuartz.withParams({
  accentColor: "#4f46e5",
  backgroundColor: "#ffffff",
  foregroundColor: "#334155",
  borderColor: "#e2e8f0",
  headerBackgroundColor: "#f8fafc",
  headerTextColor: "#475569",
  headerFontSize: 12,
  headerFontWeight: 600,
  oddRowBackgroundColor: "#ffffff",
  rowHoverColor: "#eef2ff",
  selectedRowBackgroundColor: "#e0e7ff",
  fontSize: 14,
  rowHeight: 60,
  headerHeight: 46,
  wrapperBorderRadius: 12,
  borderRadius: 8,
  cellHorizontalPadding: 20,
  inputFocusBorder: { color: "#6366f1" },
  inputFocusShadow: { color: "rgba(99,102,241,0.15)", radius: 4 },
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
      <div className="relative w-full sm:max-w-xs">
        <Search
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={quickFilter}
          onChange={(event) => setQuickFilter(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl !border !border-slate-300 !bg-white pl-9 pr-3 text-sm text-slate-900 !outline-none transition-colors placeholder:text-slate-400 hover:!border-slate-400 focus:!border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        />
      </div>

      <div className="w-full">
        <AgGridReact<T>
          theme={adminTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          loading={loading}
          quickFilterText={quickFilter}
          pagination
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[10, 25, 50]}
          domLayout="autoHeight"
          suppressCellFocus
          overlayNoRowsTemplate='<span style="color:#64748b;font-size:14px">No records found.</span>'
          {...gridOptions}
        />
      </div>
    </div>
  );
}