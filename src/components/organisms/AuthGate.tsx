import type { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Inventory2Icon from '@mui/icons-material/Inventory2';

// Renders the app only for logged-in users, so every API call has an Auth0
// token to send. Everyone else sees a login screen.
export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, error, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) return <>{children}</>;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12, px: 2 }}>
      <Paper variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 360 }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Inventory2Icon color="primary" fontSize="large" />
          <Typography variant="h6">Inventory Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Log in to manage products, stock and orders.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%', overflowWrap: 'anywhere', textAlign: 'left' }}>
              {error.message}
            </Alert>
          )}
          <Button variant="contained" fullWidth onClick={() => loginWithRedirect()}>
            Log in
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
