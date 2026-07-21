import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { StockStatusChip } from '../atoms/StockStatusChip';
import { PriceLabel } from '../atoms/PriceLabel';
import { getStockStatus, type Product } from '../../types/product';

interface ProductTableRowProps {
  product: Product;
}

export function ProductTableRow({ product }: ProductTableRowProps) {
  return (
    <TableRow hover>
      <TableCell>{product.name}</TableCell>
      <TableCell>{product.sku}</TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell align="right">{product.quantity}</TableCell>
      <TableCell align="right">
        <PriceLabel value={product.unitPrice} />
      </TableCell>
      <TableCell>
        <StockStatusChip status={getStockStatus(product)} />
      </TableCell>
    </TableRow>
  );
}
