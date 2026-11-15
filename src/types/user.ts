export const Role = {
  Administrator: 'Administrator',
  Manager: 'Manager',
  Staff: 'Staff',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// Read: see the warehouse's stock and orders. Write: also change them.
export const WarehousePermission = {
  Read: 1,
  Write: 2,
} as const;
export type WarehousePermission = (typeof WarehousePermission)[keyof typeof WarehousePermission];

export interface UserWarehousePermission {
  warehouseUid: string;
  warehouseName: string;
  permission: WarehousePermission;
}

// GET /api/users/me
export interface CurrentUser {
  uid: string;
  email: string;
  name: string | null;
  // null: signed up, waiting for an Administrator or Manager to give access.
  role: Role | null;
  // Roles this user may give on the Users page; empty if they can't open it.
  assignableRoles: Role[];
  // Empty for Administrators, who have every warehouse.
  warehouses: UserWarehousePermission[];
}

// A row of GET /api/users
export interface User {
  uid: string;
  email: string;
  name: string | null;
  role: Role | null;
  created: string;
  warehouses: UserWarehousePermission[];
  // Whether the logged-in user may change this user's access.
  canManage: boolean;
}

export interface UserQuery {
  search?: string;
  newOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface UsersApiResponse {
  users: User[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface UserAccessValues {
  role: Role | null;
  warehouses: { warehouseUid: string; permission: WarehousePermission }[];
}

export interface UserAccessResult {
  // false: the values matched what was saved; nothing was saved or emailed.
  changed: boolean;
  // false: saved, but the email to the user couldn't be sent.
  emailSent: boolean;
}
