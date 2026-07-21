export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderThreshold: number;
  unitPrice: number;
}

export function getStockStatus(product: Pick<Product, 'quantity' | 'reorderThreshold'>): StockStatus {
  if (product.quantity <= 0) return 'out-of-stock';
  if (product.quantity <= product.reorderThreshold) return 'low-stock';
  return 'in-stock';
}
