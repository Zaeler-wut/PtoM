import { useState, useMemo } from "react";
import { DEFAULT_PAGE_SIZE } from "../utils/constants";

export function usePagination<T>(data: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  // Reset to page 1 when data changes
  const reset = () => setPage(1);

  return { page, setPage, totalPages, paginated, reset };
}
