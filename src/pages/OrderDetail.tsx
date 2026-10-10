import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useInventoryData } from '../context/InventoryDataContext';
import { PriceLabel } from '../components/atoms/PriceLabel';
import { OrderStatus } from '../types/order';
import { isOrderEditable, orderStatusColor, orderStatusLabel, orderTotal, orderTypeLabel } from '../lib/orderLabels';

export function OrderDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { orders, products, warehouses, addOrderItem, removeOrderItem, changeOrderStatus } = useInventoryData();

  const order = orders.find((o) => o.uid === uid);

  const [newProductUid, setNewProductUid] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Order not found.</Typography>
      </Container>
    );
  }

  const warehouse = warehouses.find((w) => w.uid === order.warehouseUid);
  const productByUid = (productUid: string) => products.find((p) => p.uid === productUid);
  const editable = isOrderEditable(order.status);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} sx={{ mb: 2 }}>
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

      {editable && (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="success"
            disabled={order.items.length === 0}
            onClick={() => changeOrderStatus(order.uid, OrderStatus.Completed)}
          >
            Complete order
          </Button>
          <Button variant="outlined" color="error" onClick={() => changeOrderStatus(order.uid, OrderStatus.Cancelled)}>
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
                <TableCell>{productByUid(item.productUid)?.name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">
                  <PriceLabel value={item.unitPrice} />
                </TableCell>
                <TableCell align="right">
                  <PriceLabel value={item.unitPrice * item.quantity} />
                </TableCell>
                {editable && (
                  <TableCell align="right">
                    <IconButton size="small" aria-label="Remove item" onClick={() => removeOrderItem(order.uid, item.productUid)}>
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
          <TextField label="Product" select value={newProductUid} onChange={(e) => setNewProductUid(e.target.value)} size="small" sx={{ minWidth: 240 }}>
            {products.map((p) => (
              <MenuItem key={p.uid} value={p.uid}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
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
            disabled={!newProductUid || Number(newQuantity) <= 0}
            onClick={() => {
              addOrderItem(order.uid, newProductUid, Number(newQuantity));
              setNewProductUid('');
              setNewQuantity('1');
            }}
          >
            Add item
          </Button>
        </Stack>
      )}
    </Container>
  );
}
