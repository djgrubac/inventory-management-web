import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import { apiError } from '../lib/api';
import { Role, WarehousePermission, type CurrentUser } from '../types/user';

interface CurrentUserContextValue {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  // Loads /api/users/me again, e.g. after an Administrator gave this user a role.
  refresh: () => Promise<void>;
  isAdministrator: boolean;
  canManageUsers: boolean;
  // Add and edit products and categories (Administrators and Managers).
  canEditCatalog: boolean;
  // Delete products (Administrators only).
  canDeleteProducts: boolean;
  // Adjust stock and create or change orders in this warehouse.
  canWrite: (warehouseUid: string) => boolean;
  // Edit the warehouse's details: Write on it, and Manager or Administrator.
  canEditWarehouse: (warehouseUid: string) => boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

// Who is logged in, according to our API: role and warehouse permissions live
// in the API's database, not in the Auth0 token.
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const apiFetch = useApiFetch();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/users/me');
      if (!response.ok) throw await apiError(response, 'load your account');
      setUser(await response.json());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load your account.');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<CurrentUserContextValue>(() => {
    const isAdministrator = user?.role === Role.Administrator;
    const isManager = user?.role === Role.Manager;
    const writable = new Set(
      user?.warehouses.filter((w) => w.permission === WarehousePermission.Write).map((w) => w.warehouseUid),
    );
    return {
      user,
      loading,
      error,
      refresh,
      isAdministrator,
      canManageUsers: (user?.assignableRoles.length ?? 0) > 0,
      canEditCatalog: isAdministrator || isManager,
      canDeleteProducts: isAdministrator,
      canWrite: (warehouseUid) => isAdministrator || writable.has(warehouseUid),
      canEditWarehouse: (warehouseUid) => isAdministrator || (isManager && writable.has(warehouseUid)),
    };
  }, [user, loading, error, refresh]);

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error('useCurrentUser must be used within CurrentUserProvider');
  return ctx;
}
