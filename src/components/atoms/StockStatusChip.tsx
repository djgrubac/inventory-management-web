import Chip from '@mui/material/Chip';
import type { StockLevel } from '../../types/product';

const LABELS: Record<StockLevel, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
};

const COLORS: Record<StockLevel, 'success' | 'warning' | 'error'> = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'error',
};

interface StockStatusChipProps {
  level: StockLevel;
}

export function StockStatusChip({ level }: StockStatusChipProps) {
  return <Chip label={LABELS[level]} color={COLORS[level]} size="small" />;
}
