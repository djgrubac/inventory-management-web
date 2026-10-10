import { OrderStatus, OrderType, type Order } from '../types/order';

export function orderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function orderTypeLabel(type: OrderType): string {
  return type === OrderType.Incoming ? 'Incoming' : 'Outgoing';
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending:
      return 'Pending';
    case OrderStatus.Completed:
      return 'Completed';
    case OrderStatus.Cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

export function orderStatusColor(status: OrderStatus): 'warning' | 'success' | 'error' | 'default' {
  switch (status) {
    case OrderStatus.Pending:
      return 'warning';
    case OrderStatus.Completed:
      return 'success';
    case OrderStatus.Cancelled:
      return 'error';
    default:
      return 'default';
  }
}

export function isOrderEditable(status: OrderStatus): boolean {
  return status === OrderStatus.Pending;
}
