import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AddIcon from '@mui/icons-material/Add';
import { useInventoryData } from '../context/InventoryDataContext';
import { NewOrderDialog } from '../components/organisms/NewOrderDialog';
import { PriceLabel } from '../components/atoms/PriceLabel';
import { OrderType } from '../types/order';
import { orderStatusColor, orderStatusLabel, orderTotal, orderTypeLabel } from '../lib/orderLabels';

type TabFilter = 'all' | typeof OrderType.Incoming | typeof OrderType.Outgoing;

export function Orders() {
  const navigate = useNavigate();
  const { orders, warehouses, createOrder } = useInventoryData();
  const [warehouseUid, setWarehouseUid] = useState(warehouses[0]?.uid ?? '');
  const [tab, setTab] = useState<TabFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const inWarehouse = orders.filter((o) => o.warehouseUid === warehouseUid);
    if (tab === 'all') return inWarehouse;
    return inWarehouse.filter((o) => o.type === tab);
  }, [orders, warehouseUid, tab]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Orders</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} disabled={!warehouses.length}>
          New order
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <TextField label="Warehouse" select value={warehouseUid} onChange={(e) => setWarehouseUid(e.target.value)} size="small" sx={{ minWidth: 220 }}>
          {warehouses.map((w) => (
            <MenuItem key={w.uid} value={w.uid}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="All" value="all" />
          <Tab label="Incoming" value={OrderType.Incoming} />
          <Tab label="Outgoing" value={OrderType.Outgoing} />
        </Tabs>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
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
            {filtered.map((order) => (
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No orders for this warehouse yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <NewOrderDialog
        open={dialogOpen}
        warehouses={warehouses}
        defaultWarehouseUid={warehouseUid}
        onClose={() => setDialogOpen(false)}
        onSubmit={(type, uid) => {
          const orderUid = createOrder(type, uid);
          navigate(`/orders/${orderUid}`);
        }}
      />
    </Container>
  );
}
