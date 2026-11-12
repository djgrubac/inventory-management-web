import { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';
import { useInventoryData } from '../context/InventoryDataContext';
import { StockStatusChip } from '../components/atoms/StockStatusChip';
import { TablePaginationBar } from '../components/molecules/TablePaginationBar';
import { StockAdjustDialog } from '../components/organisms/StockAdjustDialog';
import { usePagination } from '../hooks/usePagination';
import { getStockLevel, type Product } from '../types/product';
import type { Stock, StockPage as StockPageResult } from '../types/stock';

const EMPTY_PAGE: StockPageResult = { stocks: [], totalCount: 0 };

export function StockPage() {
  const { products, warehouses, categories, fetchStocks, adjustStock } = useInventoryData();

  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productFilter, setProductFilter] = useState<Product | null>(null);
  const [adjusting, setAdjusting] = useState<Stock | null>(null);

  const { page, rowsPerPage, setPage, setRowsPerPage, resetPage } = usePagination();
  const [result, setResult] = useState<StockPageResult>(EMPTY_PAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped after an adjustment so the current page is fetched again.
  const [reloadKey, setReloadKey] = useState(0);

  const productOptions = useMemo(
    () => (categoryFilter ? products.filter((p) => p.categoryUid === categoryFilter) : products),
    [products, categoryFilter],
  );

  const productUid = productFilter?.uid;

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchStocks({
      warehouseUid: warehouseFilter || undefined,
      categoryUid: categoryFilter || undefined,
      productUid,
      pageNumber: page + 1,
      pageSize: rowsPerPage,
    })
      .then((data) => {
        if (!ignore) setResult(data);
      })
      .catch((err) => {
        console.error(err);
        if (!ignore) {
          setResult(EMPTY_PAGE);
          setError(err instanceof Error ? err.message : 'Failed to load stock.');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [fetchStocks, warehouseFilter, categoryFilter, productUid, page, rowsPerPage, reloadKey]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stock
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <TuneIcon color="action" fontSize="small" />
        <TextField
          label="Warehouse"
          select
          value={warehouseFilter}
          onChange={(e) => {
            setWarehouseFilter(e.target.value);
            resetPage();
          }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All warehouses</MenuItem>
          {warehouses.map((w) => (
            <MenuItem key={w.uid} value={w.uid}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Category"
          select
          value={categoryFilter}
          onChange={(e) => {
            const value = e.target.value;
            setCategoryFilter(value);
            // Drop a selected product that isn't in the new category.
            if (productFilter && value && productFilter.categoryUid !== value) setProductFilter(null);
            resetPage();
          }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.caption}
            </MenuItem>
          ))}
        </TextField>
        <Autocomplete
          options={productOptions}
          getOptionLabel={(p) => p.name}
          isOptionEqualToValue={(a, b) => a.uid === b.uid}
          value={productFilter}
          onChange={(_, p) => {
            setProductFilter(p);
            resetPage();
          }}
          size="small"
          sx={{ minWidth: 260 }}
          renderInput={(params) => <TextField {...params} label="Product" placeholder="All products" />}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.stocks.map((stock) => (
              <TableRow key={`${stock.warehouseUid}-${stock.productUid}`} hover>
                <TableCell>{stock.productName}</TableCell>
                <TableCell>{stock.warehouseName}</TableCell>
                <TableCell align="right">{stock.quantity}</TableCell>
                <TableCell>
                  <StockStatusChip level={getStockLevel(stock.quantity)} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" aria-label="Adjust stock" onClick={() => setAdjusting(stock)}>
                    <TuneIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && !error && result.stocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No stock records match these filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePaginationBar
          count={result.totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </TableContainer>

      <StockAdjustDialog
        open={!!adjusting}
        stock={adjusting}
        productName={adjusting?.productName ?? ''}
        warehouseName={adjusting?.warehouseName ?? ''}
        onClose={() => setAdjusting(null)}
        onSubmit={async (newQuantity) => {
          if (!adjusting) return;
          await adjustStock(adjusting.warehouseUid, adjusting.productUid, newQuantity);
          setReloadKey((k) => k + 1);
        }}
      />
    </Container>
  );
}
