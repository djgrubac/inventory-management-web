import { useState } from 'react';

export function usePagination(initialRowsPerPage = 10) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPageState] = useState(initialRowsPerPage);

  const setRowsPerPage = (value: number) => {
    setRowsPerPageState(value);
    setPage(0);
  };

  return { page, rowsPerPage, setPage, setRowsPerPage, resetPage: () => setPage(0) };
}

// For lists that are already fully loaded in memory. The page is clamped so
// deleting the last row of the last page doesn't leave an empty, out-of-range page.
export function useClientPagination<T>(items: T[], initialRowsPerPage = 10) {
  const pagination = usePagination(initialRowsPerPage);
  const lastPage = Math.max(0, Math.ceil(items.length / pagination.rowsPerPage) - 1);
  const page = Math.min(pagination.page, lastPage);
  const pageItems = items.slice(page * pagination.rowsPerPage, (page + 1) * pagination.rowsPerPage);

  return { ...pagination, page, pageItems };
}
