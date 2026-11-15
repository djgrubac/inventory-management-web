import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useInventoryData } from '../context/InventoryDataContext';
import { useCurrentUser } from '../context/CurrentUserContext';
import { PriceLabel } from '../components/atoms/PriceLabel';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { OrderStatus, OrderType, type Order } from '../types/order';
import type { Product } from '../types/product';
import { isOrderEditable, orderStatusColor, orderStatusLabel, orderTotal, orderTypeLabel } from '../lib/orderLabels';

type PendingStatusChange = typeof OrderStatus.Completed | typeof OrderStatus.Cancelled;

export function OrderDetail() {
  const { uid = '' } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { products, warehouses, fetchOrder, addOrderItem, removeOrderItem, changeOrderStatus } = useInventoryData();
  const { canWrite } = useCurrentUser();

  // undefined = still loading, null = not found
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<PendingStatusChange | null>(null);

  const [newProduct, setNewProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState('1');

  const loadOrder = useCallback(async () => {
    setOrder(await fetchOrder(uid));
  }, [fetchOrder, uid]);

  useEffect(() => {
    setOrder(undefined);
    setLoadError(null);
    loadOrder().catch((err) => {
      console.error(err);
      setLoadError(err instanceof Error ? err.message : 'Failed to load order.');
    });
  }, [loadOrder]);

  // Runs a mutation, then reloads the order so totals and merged quantities
  // come from the server. Errors (e.g. insufficient stock) are shown inline.
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await loadOrder();
      return true;
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{loadError}</Alert>
      </Container>
    );
  }

  if (order === undefined) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Order not found.</Typography>
      </Container>
    );
  }

  const warehouse = warehouses.find((w) => w.uid === order.warehouseUid);
  // Read-only users see the order but none of the controls that change it.
  const editable = isOrderEditable(order.status) && canWrite(order.warehouseUid);
  const quantity = Number(newQuantity);

  const handleAddItem = async () => {
    if (!newProduct) return;
    const added = await run(() => addOrderItem(order.uid, newProduct.uid, quantity));
    if (added) {
      setNewProduct(null);
      setNewQuantity('1');
    }
  };

  const handleConfirmStatus = async () => {
    if (!confirming) return;
    const status = confirming;
    setConfirming(null);
    await run(() => changeOrderStatus(order.uid, status));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/orders?warehouse=${order.warehouseUid}`)} sx={{ mb: 2 }}>
        Back to orders
      </Button>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4">{orderTypeLabel(order.type)} order</Typography>
        <Chip label={orderStatusLabel(order.status)} color={orderStatusColor(order.status)} />
      </Stack>
      <Typography color="text.secondary" gutterBottom>
        {warehouse?.name} · Created {new Date(order.created).toLocaleString()}
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Total: <PriceLabel value={orderTotal(order)} />
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {editable && (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button variant="contained" color="success" disabled={order.items.length === 0 || busy} onClick={() => setConfirming(OrderStatus.Completed)}>
            Complete order
          </Button>
          <Button variant="outlined" color="error" disabled={busy} onClick={() => setConfirming(OrderStatus.Cancelled)}>
            Cancel order
          </Button>
        </Stack>
      )}

      <TableContainer component={Paper} variant="outlined" sx={{ mb: editable ? 2 : 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit price</TableCell>
              <TableCell align="right">Total</TableCell>
              {editable && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.productUid} hover>
                <TableCell>{item.productName}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">
                  <PriceLabel value={item.unitPrice} />
                </TableCell>
                <TableCell align="right">
                  <PriceLabel value={item.unitPrice * item.quantity} />
                </TableCell>
                {editable && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="Remove item"
                      disabled={busy}
                      onClick={() => run(() => removeOrderItem(order.uid, item.productUid))}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {order.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={editable ? 5 : 4} align="center">
                  <Typography color="text.secondary">No items on this order yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {editable && (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Autocomplete
            options={products}
            getOptionLabel={(p) => p.name}
            isOptionEqualToValue={(a, b) => a.uid === b.uid}
            value={newProduct}
            onChange={(_, p) => setNewProduct(p)}
            size="small"
            sx={{ minWidth: 320 }}
            renderInput={(params) => <TextField {...params} label="Product" />}
          />
          <TextField
            label="Quantity"
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            size="small"
            sx={{ width: 120 }}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!newProduct || !Number.isInteger(quantity) || quantity <= 0 || busy}
            onClick={handleAddItem}
          >
            Add item
          </Button>
        </Stack>
      )}

      <ConfirmDialog
        open={confirming !== null}
        title={confirming === OrderStatus.Completed ? 'Complete order' : 'Cancel order'}
        description={
          confirming === OrderStatus.Completed
            ? `Completing this order will ${order.type === OrderType.Incoming ? 'add its items to' : 'remove its items from'} stock at ${warehouse?.name ?? 'the warehouse'}. This cannot be undone.`
            : 'Cancelling this order is final - it can no longer be edited or completed.'
        }
        confirmLabel={confirming === OrderStatus.Completed ? 'Complete' : 'Yes, cancel it'}
        confirmColor={confirming === OrderStatus.Completed ? 'success' : 'error'}
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirmStatus}
      />
    </Container>
  );
}
