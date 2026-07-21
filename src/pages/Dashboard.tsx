import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryIcon from '@mui/icons-material/Category';
import { StatCard } from '../components/molecules/StatCard';
import { getStockStatus } from '../types/product';
import { sampleProducts } from '../lib/sampleProducts';

export function Dashboard() {
  const totalUnits = sampleProducts.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockCount = sampleProducts.filter((p) => getStockStatus(p) !== 'in-stock').length;
  const categoryCount = new Set(sampleProducts.map((p) => p.category)).size;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Total Units" value={totalUnits} icon={<Inventory2Icon color="primary" fontSize="large" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Needs Attention" value={lowStockCount} icon={<WarningAmberIcon color="warning" fontSize="large" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Categories" value={categoryCount} icon={<CategoryIcon color="action" fontSize="large" />} />
        </Grid>
      </Grid>
    </Container>
  );
}
