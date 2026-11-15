import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Role, WarehousePermission, type User, type UserAccessValues } from '../../types/user';
import type { Warehouse } from '../../types/warehouse';

const NONE = 'none';
type Choice = typeof NONE | WarehousePermission;

interface UserAccessDialogProps {
  user: User | null;
  // Warehouses the logged-in user can see.
  warehouses: Warehouse[];
  // Roles the logged-in user may give (Managers: Staff only).
  assignableRoles: Role[];
  // Managers may only change warehouses where they have Write.
  canWrite: (warehouseUid: string) => boolean;
  onClose: () => void;
  onSubmit: (values: UserAccessValues) => Promise<void>;
}

export function UserAccessDialog({ user, warehouses, assignableRoles, canWrite, onClose, onSubmit }: UserAccessDialogProps) {
  const [role, setRole] = useState<Role | ''>('');
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setRole(user.role ?? '');
    setChoices(Object.fromEntries(user.warehouses.map((w) => [w.warehouseUid, w.permission])));
    setError(null);
  }, [user]);

  const usesWarehouses = role === Role.Manager || role === Role.Staff;
  const readOnlyWarehouses = warehouses.some((w) => !canWrite(w.uid));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        role: role || null,
        warehouses: Object.entries(choices)
          .filter((entry): entry is [string, WarehousePermission] => entry[1] !== NONE)
          .map(([warehouseUid, permission]) => ({ warehouseUid, permission })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={user !== null} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Access for {user?.name || user?.email}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {user?.name && (
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          )}

          <TextField
            label="Role"
            select
            value={role}
            onChange={(e) => setRole(e.target.value as Role | '')}
            helperText={role ? undefined : 'Without a role the user sees "Waiting for access".'}
          >
            <MenuItem value="">
              <em>No role</em>
            </MenuItem>
            {assignableRoles.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>

          {role === Role.Administrator && (
            <Alert severity="info">Administrators see and change every warehouse.</Alert>
          )}

          {usesWarehouses && (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Warehouses</Typography>
              <Typography variant="body2" color="text.secondary">
                Read: see stock and orders. Write: also change them.
                {readOnlyWarehouses && ' You can only change warehouses where you have Write.'}
              </Typography>
              {warehouses.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No warehouses yet.
                </Typography>
              )}
              {warehouses.map((warehouse) => (
                <Stack
                  key={warehouse.uid}
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
                >
                  <Typography>{warehouse.name}</Typography>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={choices[warehouse.uid] ?? NONE}
                    disabled={!canWrite(warehouse.uid)}
                    onChange={(_, value: Choice | null) => {
                      if (value !== null) setChoices((prev) => ({ ...prev, [warehouse.uid]: value }));
                    }}
                  >
                    <ToggleButton value={NONE}>None</ToggleButton>
                    <ToggleButton value={WarehousePermission.Read}>Read</ToggleButton>
                    <ToggleButton value={WarehousePermission.Write}>Write</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              ))}
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Save and notify'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
