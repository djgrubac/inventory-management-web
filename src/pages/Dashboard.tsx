import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { StatCard } from '../components/molecules/StatCard';
import { PriceLabel } from '../components/atoms/PriceLabel';
import { useInventoryData } from '../context/InventoryDataContext';
import { getStockLevel } from '../types/product';
import { OrderStatus } from '../types/order';
import { orderStatusColor, orderStatusLabel, orderTotal, orderTypeLabel } from '../lib/orderLabels';

export function Dashboard() {
  const navigate = useNavigate();
  const { products, warehouses, orders } = useInventoryData();

  const lowStockCount = useMemo(() => products.filter((p) => getStockLevel(p.stockQuantity) !== 'in-stock').length, [products]);
  const pendingOrdersCount = useMemo(() => orders.filter((o) => o.status === OrderStatus.Pending).length, [orders]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 5),
    [orders],
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1, mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total products" value={products.length} icon={<Inventory2Icon color="primary" fontSize="large" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Needs attention" value={lowStockCount} icon={<WarningAmberIcon color="warning" fontSize="large" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Warehouses" value={warehouses.length} icon={<WarehouseIcon color="action" fontSize="large" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Pending orders" value={pendingOrdersCount} icon={<PendingActionsIcon color="info" fontSize="large" />} />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Recent orders
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.uid} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.uid}`)}>
                <TableCell>{new Date(order.created).toLocaleString()}</TableCell>
                <TableCell>{warehouses.find((w) => w.uid === order.warehouseUid)?.name}</TableCell>
                <TableCell>{orderTypeLabel(order.type)}</TableCell>
                <TableCell>
                  <Chip label={orderStatusLabel(order.status)} color={orderStatusColor(order.status)} size="small" />
                </TableCell>
                <TableCell align="right">
                  <PriceLabel value={orderTotal(order)} />
                </TableCell>
              </TableRow>
            ))}
            {recentOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No orders yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
