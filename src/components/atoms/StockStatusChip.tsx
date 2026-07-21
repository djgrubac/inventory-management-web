import Chip from '@mui/material/Chip';
import type { StockStatus } from '../../types/product';

const LABELS: Record<StockStatus, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
};

const COLORS: Record<StockStatus, 'success' | 'warning' | 'error'> = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'error',
};

interface StockStatusChipProps {
  status: StockStatus;
}

export function StockStatusChip({ status }: StockStatusChipProps) {
  return <Chip label={LABELS[status]} color={COLORS[status]} size="small" />;
}
