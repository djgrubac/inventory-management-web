import type { Product } from '../types/product';

export const sampleProducts: Product[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'WM-1001', category: 'Electronics', quantity: 42, reorderThreshold: 15, unitPrice: 19.99 },
  { id: '2', name: 'Mechanical Keyboard', sku: 'MK-2003', category: 'Electronics', quantity: 8, reorderThreshold: 10, unitPrice: 79.5 },
  { id: '3', name: 'USB-C Cable 2m', sku: 'CB-3050', category: 'Accessories', quantity: 0, reorderThreshold: 20, unitPrice: 8.25 },
  { id: '4', name: 'Monitor Stand', sku: 'MS-4010', category: 'Furniture', quantity: 27, reorderThreshold: 5, unitPrice: 34.0 },
  { id: '5', name: 'Desk Lamp', sku: 'DL-5090', category: 'Furniture', quantity: 12, reorderThreshold: 12, unitPrice: 22.75 },
];
