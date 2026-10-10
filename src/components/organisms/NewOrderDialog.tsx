import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { OrderType } from '../../types/order';
import { orderTypeLabel } from '../../lib/orderLabels';
import type { Warehouse } from '../../types/warehouse';

interface NewOrderDialogProps {
  open: boolean;
  warehouses: Warehouse[];
  defaultWarehouseUid: string;
  onClose: () => void;
  onSubmit: (type: OrderType, warehouseUid: string) => void;
}

export function NewOrderDialog({ open, warehouses, defaultWarehouseUid, onClose, onSubmit }: NewOrderDialogProps) {
  const [type, setType] = useState<OrderType>(OrderType.Incoming);
  const [warehouseUid, setWarehouseUid] = useState(defaultWarehouseUid);

  useEffect(() => {
    if (open) {
      setType(OrderType.Incoming);
      setWarehouseUid(defaultWarehouseUid);
    }
  }, [open, defaultWarehouseUid]);

  const handleSubmit = () => {
    onSubmit(type, warehouseUid);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>New order</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!warehouseUid}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
