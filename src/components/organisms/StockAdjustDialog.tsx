import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import type { Stock } from '../../types/stock';

interface StockAdjustDialogProps {
  open: boolean;
  stock: Stock | null;
  productName: string;
  warehouseName: string;
  onClose: () => void;
  onSubmit: (newQuantity: number) => Promise<void>;
}

export function StockAdjustDialog({ open, stock, productName, warehouseName, onClose, onSubmit }: StockAdjustDialogProps) {
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && stock) {
      setQuantity(String(stock.quantity));
      setError(null);
    }
  }, [open, stock]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(Number(quantity));
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isValid = quantity !== '' && !Number.isNaN(Number(quantity)) && Number(quantity) >= 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adjust stock</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {productName} @ {warehouseName}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="New quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
          autoFocus
          slotProps={{ htmlInput: { min: 0, step: 1 } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
