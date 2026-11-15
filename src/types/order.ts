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
  productName: string;
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

export interface OrderQuery {
  warehouseUid?: string;
  type?: OrderType;
  status?: OrderStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface OrderPage {
  orders: Order[];
  totalCount: number;
}

export interface OrderApiItem {
  uid: string;
  status: OrderStatus;
  type: OrderType;
  warehouse: { uid: string };
  items: { product: { uid: string; name: string }; quantity: number; unitPrice: number }[];
  created: string;
}

export interface OrdersApiResponse {
  orders: OrderApiItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}
