import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import AddIcon from '@mui/icons-material/Add';
import { useInventoryData } from '../context/InventoryDataContext';
import { useCurrentUser } from '../context/CurrentUserContext';
import { NewOrderDialog } from '../components/organisms/NewOrderDialog';
import { PriceLabel } from '../components/atoms/PriceLabel';
import { TablePaginationBar } from '../components/molecules/TablePaginationBar';
import { usePagination } from '../hooks/usePagination';
import { OrderType, type OrderPage } from '../types/order';
import { orderStatusColor, orderStatusLabel, orderTotal, orderTypeLabel } from '../lib/orderLabels';

type TabFilter = 'all' | typeof OrderType.Incoming | typeof OrderType.Outgoing;

const EMPTY_PAGE: OrderPage = { orders: [], totalCount: 0 };

export function Orders() {
  const navigate = useNavigate();
  const { warehouses, fetchOrders, createOrder } = useInventoryData();
  const { canWrite } = useCurrentUser();
  // New orders can only go to warehouses the user has Write on.
  const writableWarehouses = warehouses.filter((w) => canWrite(w.uid));

  // Warehouse and type live in the URL so "Back to orders" from a detail page
  // lands on the same list.
  const [searchParams, setSearchParams] = useSearchParams();
  const warehouseUid = searchParams.get('warehouse') || warehouses[0]?.uid || '';
  const typeParam = Number(searchParams.get('type'));
  const tab: TabFilter = typeParam === OrderType.Incoming || typeParam === OrderType.Outgoing ? typeParam : 'all';

  const { page, rowsPerPage, setPage, setRowsPerPage, resetPage } = usePagination();
  const [result, setResult] = useState<OrderPage>(EMPTY_PAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!warehouseUid) return;

    let ignore = false;
    setLoading(true);
    setError(null);
    fetchOrders({
      warehouseUid,
      type: tab === 'all' ? undefined : tab,
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
          setError(err instanceof Error ? err.message : 'Failed to load orders.');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [fetchOrders, warehouseUid, tab, page, rowsPerPage]);

  const updateFilter = (key: 'warehouse' | 'type', value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
    resetPage();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Orders</Typography>
        {writableWarehouses.length > 0 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New order
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <TextField
          label="Warehouse"
          select
          value={warehouses.length ? warehouseUid : ''}
          onChange={(e) => updateFilter('warehouse', e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
        >
          {warehouses.map((w) => (
            <MenuItem key={w.uid} value={w.uid}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>
        <Tabs value={tab} onChange={(_, v: TabFilter) => updateFilter('type', v === 'all' ? '' : String(v))}>
          <Tab label="All" value="all" />
          <Tab label="Incoming" value={OrderType.Incoming} />
          <Tab label="Outgoing" value={OrderType.Outgoing} />
        </Tabs>
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
              <TableCell>Created</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.orders.map((order) => (
              <TableRow key={order.uid} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.uid}`)}>
                <TableCell>{new Date(order.created).toLocaleString()}</TableCell>
                <TableCell>{orderTypeLabel(order.type)}</TableCell>
                <TableCell>
                  <Chip label={orderStatusLabel(order.status)} color={orderStatusColor(order.status)} size="small" />
                </TableCell>
                <TableCell align="right">{order.items.length}</TableCell>
                <TableCell align="right">
                  <PriceLabel value={orderTotal(order)} />
                </TableCell>
              </TableRow>
            ))}
            {!loading && !error && result.orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No orders for this warehouse yet.</Typography>
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

      <NewOrderDialog
        open={dialogOpen}
        warehouses={writableWarehouses}
        defaultWarehouseUid={canWrite(warehouseUid) ? warehouseUid : (writableWarehouses[0]?.uid ?? '')}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (type, uid) => {
          const orderUid = await createOrder(type, uid);
          navigate(`/orders/${orderUid}`);
        }}
      />
    </Container>
  );
}
