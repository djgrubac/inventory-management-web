import { useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useInventoryData } from '../context/InventoryDataContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ProductTable } from '../components/organisms/ProductTable';
import { ProductFormDialog } from '../components/organisms/ProductFormDialog';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import type { Product } from '../types/product';

export function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useInventoryData();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [categoryFilter, setCategoryFilter] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || p.categoryUid === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, categoryFilter]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add product
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 320, maxWidth: '100%' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField label="Category" select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.caption}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <ProductTable products={filtered} categories={categories} onEdit={openEdit} onDelete={setDeleting} />

      <ProductFormDialog
        open={dialogOpen}
        product={editing}
        categories={categories}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => (editing ? updateProduct(editing.uid, values) : addProduct(values))}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete product"
        description={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteProduct(deleting.uid);
          setDeleting(null);
        }}
      />
    </Container>
  );
}
