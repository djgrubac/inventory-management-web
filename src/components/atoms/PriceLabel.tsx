import Typography from '@mui/material/Typography';

interface PriceLabelProps {
  value: number;
  currency?: string;
}

export function PriceLabel({ value, currency = 'USD' }: PriceLabelProps) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  return <Typography component="span">{formatted}</Typography>;
}
