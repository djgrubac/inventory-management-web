import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ProductTableRow } from '../molecules/ProductTableRow';
import type { Category } from '../../types/category';
import type { Product } from '../../types/product';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, categories, onEdit, onDelete }: ProductTableProps) {
  const categoryCaption = (categoryUid: string) => categories.find((c) => c.uid === categoryUid)?.caption ?? 'Uncategorized';

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Unit price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <ProductTableRow
              key={product.uid}
              product={product}
              categoryCaption={categoryCaption(product.categoryUid)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="text.secondary">No products found.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
