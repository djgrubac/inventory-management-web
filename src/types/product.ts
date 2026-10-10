export interface Product {
  uid: string;
  name: string;
  categoryUid: string;
  price: number;
  stockQuantity: number;
  description: string;
}

export interface ProductFormValues {
  name: string;
  categoryUid: string;
  price: number;
  stockQuantity: number;
  description: string;
}

// There's no reorder-threshold concept on Product, so "low stock" is a
// simple, made-up cutoff rather than a value a backend would define.
export const LOW_STOCK_THRESHOLD = 10;

export type StockLevel = 'out-of-stock' | 'low-stock' | 'in-stock';

export function getStockLevel(quantity: number): StockLevel {
  if (quantity <= 0) return 'out-of-stock';
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'in-stock';
}
