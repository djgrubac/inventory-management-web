import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { StockStatusChip } from '../atoms/StockStatusChip';
import { PriceLabel } from '../atoms/PriceLabel';
import { getStockLevel, type Product } from '../../types/product';

interface ProductTableRowProps {
  product: Product;
  categoryCaption: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTableRow({ product, categoryCaption, onEdit, onDelete }: ProductTableRowProps) {
  return (
    <TableRow hover>
      <TableCell>{product.name}</TableCell>
      <TableCell>{categoryCaption}</TableCell>
      <TableCell align="right">{product.stockQuantity}</TableCell>
      <TableCell align="right">
        <PriceLabel value={product.price} />
      </TableCell>
      <TableCell>
        <StockStatusChip level={getStockLevel(product.stockQuantity)} />
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton size="small" aria-label="Edit product" onClick={() => onEdit(product)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Delete product" onClick={() => onDelete(product)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
