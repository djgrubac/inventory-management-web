export const OrderType = {
  Incoming: 1,
  Outgoing: 2,
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const OrderStatus = {
  Pending: 2,
  Completed: 3,
  Cancelled: 4,
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItem {
  productUid: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  uid: string;
  status: OrderStatus;
  type: OrderType;
  warehouseUid: string;
  items: OrderItem[];
  created: string;
}
