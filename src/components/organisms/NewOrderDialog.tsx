import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { OrderType } from '../../types/order';
import { orderTypeLabel } from '../../lib/orderLabels';
import type { Warehouse } from '../../types/warehouse';

interface NewOrderDialogProps {
  open: boolean;
  warehouses: Warehouse[];
  defaultWarehouseUid: string;
  onClose: () => void;
  onSubmit: (type: OrderType, warehouseUid: string) => Promise<void>;
}

export function NewOrderDialog({ open, warehouses, defaultWarehouseUid, onClose, onSubmit }: NewOrderDialogProps) {
  const [type, setType] = useState<OrderType>(OrderType.Incoming);
  const [warehouseUid, setWarehouseUid] = useState(defaultWarehouseUid);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setType(OrderType.Incoming);
      setWarehouseUid(defaultWarehouseUid);
      setError(null);
    }
  }, [open, defaultWarehouseUid]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(type, warehouseUid);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>New order</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Type" select value={type} onChange={(e) => setType(Number(e.target.value) as OrderType)} fullWidth>
            <MenuItem value={OrderType.Incoming}>{orderTypeLabel(OrderType.Incoming)}</MenuItem>
            <MenuItem value={OrderType.Outgoing}>{orderTypeLabel(OrderType.Outgoing)}</MenuItem>
          </TextField>
          <TextField label="Warehouse" select value={warehouseUid} onChange={(e) => setWarehouseUid(e.target.value)} fullWidth>
            {warehouses.map((w) => (
              <MenuItem key={w.uid} value={w.uid}>
                {w.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!warehouseUid || saving}>
          {saving ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
