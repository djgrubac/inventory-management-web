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
import type { Category } from '../../types/category';
import type { Product, ProductFormValues } from '../../types/product';

const EMPTY_FORM: ProductFormValues = { name: '', categoryUid: '', price: 0, stockQuantity: 0, description: '' };

interface ProductFormDialogProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductFormDialog({ open, product, categories, onClose, onSubmit }: ProductFormDialogProps) {
  const [values, setValues] = useState<ProductFormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(product ?? { ...EMPTY_FORM, categoryUid: categories[0]?.uid ?? '' });
      setError(null);
    }
  }, [open, product, categories]);

  const handleChange = (field: keyof ProductFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const value = field === 'price' || field === 'stockQuantity' ? Number(raw) : raw;
    setValues((v) => ({ ...v, [field]: value }));
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

  const isValid = values.name.trim() && values.categoryUid && values.price >= 0 && values.stockQuantity >= 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Edit product' : 'Add product'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" value={values.name} onChange={handleChange('name')} fullWidth autoFocus />
          <TextField label="Category" select value={values.categoryUid} onChange={handleChange('categoryUid')} fullWidth>
            {categories.map((category) => (
              <MenuItem key={category.uid} value={category.uid}>
                {category.caption}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Price"
            type="number"
            value={values.price}
            onChange={handleChange('price')}
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />
          <TextField
            label="Stock quantity"
            type="number"
            value={values.stockQuantity}
            onChange={handleChange('stockQuantity')}
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
          <TextField
            label="Description"
            value={values.description}
            onChange={handleChange('description')}
            fullWidth
            multiline
            minRows={2}
          />
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
