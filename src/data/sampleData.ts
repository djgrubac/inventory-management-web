import type { Category } from '../types/category';
import type { Warehouse } from '../types/warehouse';
import type { Product } from '../types/product';
import type { Stock } from '../types/stock';
import { OrderStatus, OrderType, type Order } from '../types/order';

export const sampleCategories: Category[] = [
  { uid: 'cat-1', caption: 'Electronics' },
  { uid: 'cat-2', caption: 'Office supplies' },
  { uid: 'cat-3', caption: 'Packaging' },
];

export const sampleWarehouses: Warehouse[] = [
  { uid: 'wh-1', name: 'Main warehouse', address: 'Bulevar Nemanjica 72', contactPerson: 'Djordje', company: 'Acme Ltd' },
  { uid: 'wh-2', name: 'Auxiliary warehouse', address: 'Vizantijski Bulevar 134', contactPerson: 'Nikola', company: 'Acme Ltd' },
];

export const sampleProducts: Product[] = [
  { uid: 'prod-1', name: 'Wireless mouse', categoryUid: 'cat-1', price: 19.99, stockQuantity: 120, description: 'Ergonomic 2.4GHz mouse' },
  { uid: 'prod-2', name: 'USB-C hub', categoryUid: 'cat-1', price: 34.5, stockQuantity: 45, description: '6-in-1 hub' },
  { uid: 'prod-3', name: 'Notebook A5', categoryUid: 'cat-2', price: 3.25, stockQuantity: 300, description: 'Ruled, 96 pages' },
  { uid: 'prod-4', name: 'Ballpoint pen', categoryUid: 'cat-2', price: 0.75, stockQuantity: 8, description: 'Blue ink, pack of 1' },
  { uid: 'prod-5', name: 'Shipping box (M)', categoryUid: 'cat-3', price: 1.1, stockQuantity: 0, description: '30x20x15cm cardboard box' },
  { uid: 'prod-6', name: 'Bubble wrap roll', categoryUid: 'cat-3', price: 12.0, stockQuantity: 27, description: '50m roll' },
];

export const sampleStocks: Stock[] = [
  { warehouseUid: 'wh-1', productUid: 'prod-1', quantity: 80 },
  { warehouseUid: 'wh-1', productUid: 'prod-2', quantity: 30 },
  { warehouseUid: 'wh-1', productUid: 'prod-4', quantity: 5 },
  { warehouseUid: 'wh-2', productUid: 'prod-1', quantity: 40 },
  { warehouseUid: 'wh-2', productUid: 'prod-3', quantity: 300 },
  { warehouseUid: 'wh-2', productUid: 'prod-6', quantity: 27 },
];

export const sampleOrders: Order[] = [
  {
    uid: 'order-1',
    status: OrderStatus.Completed,
    type: OrderType.Incoming,
    warehouseUid: 'wh-1',
    items: [
      { productUid: 'prod-1', quantity: 80, unitPrice: 19.99 },
      { productUid: 'prod-2', quantity: 30, unitPrice: 34.5 },
    ],
    created: '2026-07-10T09:15:00.000Z',
  },
  {
    uid: 'order-2',
    status: OrderStatus.Pending,
    type: OrderType.Outgoing,
    warehouseUid: 'wh-1',
    items: [{ productUid: 'prod-4', quantity: 3, unitPrice: 0.75 }],
    created: '2026-07-22T14:40:00.000Z',
  },
  {
    uid: 'order-3',
    status: OrderStatus.Cancelled,
    type: OrderType.Incoming,
    warehouseUid: 'wh-2',
    items: [{ productUid: 'prod-6', quantity: 10, unitPrice: 12.0 }],
    created: '2026-06-30T11:00:00.000Z',
  },
];
