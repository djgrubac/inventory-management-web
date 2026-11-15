import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import { useCurrentUser } from '../context/CurrentUserContext';
import { useInventoryData } from '../context/InventoryDataContext';
import { UserAccessDialog } from '../components/organisms/UserAccessDialog';
import { TablePaginationBar } from '../components/molecules/TablePaginationBar';
import { useApiFetch } from '../hooks/useApiFetch';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePagination } from '../hooks/usePagination';
import { apiError, toQueryString } from '../lib/api';
import { roleColor, warehousesSummary } from '../lib/userLabels';
import type { User, UserAccessResult, UserAccessValues, UsersApiResponse } from '../types/user';

interface Notice {
  severity: 'success' | 'warning' | 'info';
  message: string;
}

// Administrators and Managers give people who signed up a role and warehouses.
export function Users() {
  const apiFetch = useApiFetch();
  const { user: me, canWrite } = useCurrentUser();
  const { warehouses } = useInventoryData();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [newOnly, setNewOnly] = useState(false);
  const { page, rowsPerPage, setPage, setRowsPerPage, resetPage } = usePagination();

  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<User | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    const query = toQueryString({
      search: debouncedSearch,
      newOnly: newOnly || undefined,
      pageNumber: page + 1,
      pageSize: rowsPerPage,
    });
    apiFetch(`/api/users?${query}`)
      .then(async (response) => {
        if (!response.ok) throw await apiError(response, 'load users');
        const data: UsersApiResponse = await response.json();
        if (!ignore) {
          setUsers(data.users);
          setTotalCount(data.totalCount);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!ignore) {
          setUsers([]);
          setTotalCount(0);
          setError(err instanceof Error ? err.message : 'Failed to load users.');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [apiFetch, debouncedSearch, newOnly, page, rowsPerPage, reloadKey]);

  const saveAccess = useCallback(
    async (user: User, values: UserAccessValues) => {
      const response = await apiFetch(`/api/users/${user.uid}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw await apiError(response, 'save access');

      const result: UserAccessResult = await response.json();
      setEditing(null);
      setReloadKey((k) => k + 1);
      setNotice(
        !result.changed
          ? { severity: 'info', message: `Nothing changed for ${user.email}.` }
          : result.emailSent
            ? { severity: 'success', message: `Saved. Email sent to ${user.email}.` }
            : { severity: 'warning', message: `Saved, but the email to ${user.email} couldn't be sent. Let them know yourself.` },
      );
    },
    [apiFetch],
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Users
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <TextField
          label="Search email or name"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          sx={{ minWidth: 280 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={newOnly}
              onChange={(e) => {
                setNewOnly(e.target.checked);
                resetPage();
              }}
            />
          }
          label="Waiting for access only"
        />
      </Stack>

      {notice && (
        <Alert severity={notice.severity} onClose={() => setNotice(null)} sx={{ mb: 2 }}>
          {notice.message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Warehouses</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid} hover>
                <TableCell>{user.email || '—'}</TableCell>
                <TableCell>{user.name || '—'}</TableCell>
                <TableCell>{new Date(user.created).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={user.role ?? 'New'} color={roleColor(user.role)} size="small" />
                </TableCell>
                <TableCell sx={{ maxWidth: 320 }}>{warehousesSummary(user)}</TableCell>
                <TableCell align="right">
                  {user.canManage ? (
                    <IconButton size="small" aria-label="Edit access" onClick={() => setEditing(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Tooltip title={user.uid === me?.uid ? "You can't change your own access" : "You can't change this user's access"}>
                      <span>
                        <IconButton size="small" aria-label="Edit access" disabled>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!loading && !error && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    {newOnly ? 'Nobody is waiting for access.' : 'No users found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePaginationBar
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </TableContainer>

      <UserAccessDialog
        user={editing}
        warehouses={warehouses}
        assignableRoles={me?.assignableRoles ?? []}
        canWrite={canWrite}
        onClose={() => setEditing(null)}
        onSubmit={(values) => saveAccess(editing!, values)}
      />
    </Container>
  );
}
