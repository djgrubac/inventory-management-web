import TablePagination from '@mui/material/TablePagination';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface TablePaginationBarProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export function TablePaginationBar({ count, page, rowsPerPage, onPageChange, onRowsPerPageChange }: TablePaginationBarProps) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={(_, p) => onPageChange(p)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
    />
  );
}
