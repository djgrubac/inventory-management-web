import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useInventoryData } from '../context/InventoryDataContext';
import { useCurrentUser } from '../context/CurrentUserContext';
import { WarehouseFormDialog } from '../components/organisms/WarehouseFormDialog';
import { TablePaginationBar } from '../components/molecules/TablePaginationBar';
import { useClientPagination } from '../hooks/usePagination';
import type { Warehouse } from '../types/warehouse';

export function Warehouses() {
  const { warehouses, addWarehouse, updateWarehouse } = useInventoryData();
  // Only Administrators add warehouses; Managers edit the ones they have Write on.
  const { isAdministrator, canEditWarehouse } = useCurrentUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const { page, rowsPerPage, pageItems, setPage, setRowsPerPage } = useClientPagination(warehouses);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (warehouse: Warehouse) => {
    setEditing(warehouse);
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Warehouses</Typography>
        {isAdministrator && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add warehouse
          </Button>
        )}
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contact person</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map((warehouse) => (
              <TableRow key={warehouse.uid} hover>
                <TableCell>{warehouse.name}</TableCell>
                <TableCell>{warehouse.address}</TableCell>
                <TableCell>{warehouse.contactPerson}</TableCell>
                <TableCell align="right">
                  {canEditWarehouse(warehouse.uid) && (
                    <IconButton size="small" aria-label="Edit warehouse" onClick={() => openEdit(warehouse)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {warehouses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">No warehouses yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePaginationBar
          count={warehouses.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </TableContainer>

      <WarehouseFormDialog
        open={dialogOpen}
        warehouse={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => (editing ? updateWarehouse(editing.uid, values) : addWarehouse(values))}
      />
    </Container>
  );
}
