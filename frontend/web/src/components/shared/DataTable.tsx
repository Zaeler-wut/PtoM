import { useState } from "react";
import { RiSearchLine } from "react-icons/ri";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  columns, data, keyExtractor, isLoading = false,
  searchable = false, searchPlaceholder = "ค้นหา...",
  onSearch, searchValue = "", emptyMessage = "ไม่พบข้อมูล",
  onRowClick, actions,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      {(searchable || actions) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {searchable && (
            <div className="relative w-64">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 transition-colors"
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">กำลังโหลด...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? "cursor-pointer hover:bg-purple-50/50" : "hover:bg-gray-50"} transition-colors`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}