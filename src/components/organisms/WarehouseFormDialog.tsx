import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import type { Warehouse, WarehouseFormValues } from '../../types/warehouse';

const EMPTY_FORM: WarehouseFormValues = { name: '', address: '', contactPerson: '', company: '' };

interface WarehouseFormDialogProps {
  open: boolean;
  warehouse: Warehouse | null;
  onClose: () => void;
  onSubmit: (values: WarehouseFormValues) => Promise<void>;
}

export function WarehouseFormDialog({ open, warehouse, onClose, onSubmit }: WarehouseFormDialogProps) {
  const [values, setValues] = useState<WarehouseFormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(warehouse ?? EMPTY_FORM);
      setError(null);
    }
  }, [open, warehouse]);

  const handleChange = (field: keyof WarehouseFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isValid = values.name.trim() && values.address.trim() && values.contactPerson.trim() && values.company.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{warehouse ? 'Edit warehouse' : 'Add warehouse'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" value={values.name} onChange={handleChange('name')} fullWidth autoFocus />
          <TextField label="Address" value={values.address} onChange={handleChange('address')} fullWidth />
          <TextField label="Contact person" value={values.contactPerson} onChange={handleChange('contactPerson')} fullWidth />
          <TextField label="Company" value={values.company} onChange={handleChange('company')} fullWidth />
        </Stack>
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
