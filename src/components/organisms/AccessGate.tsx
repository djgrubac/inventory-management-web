import { useState, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useCurrentUser } from '../../context/CurrentUserContext';

// Renders the app only once the API has given this user a role. Someone who
// just signed up sees "Waiting for access" until an Administrator or Manager
// gives them one on the Users page.
export function AccessGate({ children }: { children: ReactNode }) {
  const { user, loading, error, refresh } = useCurrentUser();
  const { logout } = useAuth0();
  const [checked, setChecked] = useState(false);

  if (!user && loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user?.role) return <>{children}</>;

  const checkAgain = async () => {
    await refresh();
    setChecked(true);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12, px: 2 }}>
      <Paper variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <HourglassEmptyIcon color="primary" fontSize="large" />
          <Typography variant="h6">{user ? 'Waiting for access' : 'Something went wrong'}</Typography>
          {user ? (
            <Typography variant="body2" color="text.secondary">
              You're signed in as <strong>{user.email}</strong>. An administrator or manager needs to give you a
              role and warehouses. You'll get an email when that's done.
            </Typography>
          ) : (
            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
              {error ?? 'Could not load your account.'}
            </Alert>
          )}
          {user && checked && !loading && !error && (
            <Typography variant="body2" color="text.secondary">
              No access yet.
            </Typography>
          )}
          {user && error && (
            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
              {error}
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            <Button variant="contained" fullWidth onClick={checkAgain} disabled={loading}>
              {loading ? 'Checking…' : user ? 'Check again' : 'Try again'}
            </Button>
            <Button variant="outlined" fullWidth onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
              Log out
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
