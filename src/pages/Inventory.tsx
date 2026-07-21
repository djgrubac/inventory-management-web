import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ProductTable } from '../components/organisms/ProductTable';
import { sampleProducts } from '../lib/sampleProducts';

export function Inventory() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Inventory
      </Typography>
      <ProductTable products={sampleProducts} />
    </Container>
  );
}
