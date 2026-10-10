import { useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';
import { useInventoryData } from '../context/InventoryDataContext';
import { StockStatusChip } from '../components/atoms/StockStatusChip';
import { StockAdjustDialog } from '../components/organisms/StockAdjustDialog';
import { getStockLevel } from '../types/product';
import type { Stock } from '../types/stock';

export function StockPage() {
  const { stocks, products, warehouses, categories, adjustStock } = useInventoryData();

  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [adjusting, setAdjusting] = useState<Stock | null>(null);

  const productByUid = (uid: string) => products.find((p) => p.uid === uid);
  const warehouseByUid = (uid: string) => warehouses.find((w) => w.uid === uid);

  const filtered = useMemo(
    () =>
      stocks.filter((s) => {
        if (warehouseFilter && s.warehouseUid !== warehouseFilter) return false;
        if (productFilter && s.productUid !== productFilter) return false;
        if (categoryFilter && productByUid(s.productUid)?.categoryUid !== categoryFilter) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stocks, warehouseFilter, productFilter, categoryFilter],
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stock
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <TuneIcon color="action" fontSize="small" />
        <TextField label="Warehouse" select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          <MenuItem value="">All warehouses</MenuItem>
          {warehouses.map((w) => (
            <MenuItem key={w.uid} value={w.uid}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Category" select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.caption}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Product" select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          <MenuItem value="">All products</MenuItem>
          {products.map((p) => (
            <MenuItem key={p.uid} value={p.uid}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
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
            {filtered.map((stock) => (
              <TableRow key={`${stock.warehouseUid}-${stock.productUid}`} hover>
                <TableCell>{productByUid(stock.productUid)?.name}</TableCell>
                <TableCell>{warehouseByUid(stock.warehouseUid)?.name}</TableCell>
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No stock records match these filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <StockAdjustDialog
        open={!!adjusting}
        stock={adjusting}
        productName={adjusting ? (productByUid(adjusting.productUid)?.name ?? '') : ''}
        warehouseName={adjusting ? (warehouseByUid(adjusting.warehouseUid)?.name ?? '') : ''}
        onClose={() => setAdjusting(null)}
        onSubmit={async (newQuantity) => {
          if (!adjusting) return;
          await adjustStock(adjusting.warehouseUid, adjusting.productUid, newQuantity);
        }}
      />
    </Container>
  );
}
