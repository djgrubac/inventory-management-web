import { Role, WarehousePermission, type User } from '../types/user';

export function roleColor(role: Role | null): 'primary' | 'secondary' | 'default' | 'warning' {
  switch (role) {
    case Role.Administrator:
      return 'primary';
    case Role.Manager:
      return 'secondary';
    case Role.Staff:
      return 'default';
    default:
      return 'warning';
  }
}

export function permissionLabel(permission: WarehousePermission): string {
  return permission === WarehousePermission.Write ? 'Write' : 'Read';
}

// Short text for the Users table, e.g. "North (Write), South (Read)".
export function warehousesSummary(user: User): string {
  if (user.role === Role.Administrator) return 'All warehouses';
  if (user.warehouses.length === 0) return '—';
  return [...user.warehouses]
    .sort((a, b) => a.warehouseName.localeCompare(b.warehouseName))
    .map((w) => `${w.warehouseName} (${permissionLabel(w.permission)})`)
    .join(', ');
}
