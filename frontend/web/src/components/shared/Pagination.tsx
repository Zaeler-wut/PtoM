import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri"

const ROWS_OPTIONS = [10, 20, 50, 100]

interface Props {
  total: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}

export function Pagination({ total, page, rowsPerPage, onPageChange, onRowsPerPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
  const from = total === 0 ? 0 : (page - 1) * rowsPerPage + 1
  const to = Math.min(page * rowsPerPage, total)

  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages]
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, "...", page - 1, page, page + 1, "...", totalPages]
  })()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>แสดง</span>
        <select
          value={rowsPerPage}
          onChange={(e) => { onRowsPerPageChange(Number(e.target.value)); onPageChange(1) }}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
        >
          {ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>แถว · {from}–{to} จาก {total} รายการ</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <RiArrowLeftSLine size={18} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <RiArrowRightSLine size={18} />
        </button>
      </div>
    </div>
  )
}
