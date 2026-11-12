import { useAuth0 } from '@auth0/auth0-react';
import AppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/warehouses', label: 'Warehouses' },
  { to: '/stock', label: 'Stock' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
];

export function AppHeader() {
  const { user, logout } = useAuth0();

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Inventory2Icon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Inventory Management
        </Typography>
        <Stack direction="row" spacing={1}>
          {NAV_LINKS.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              end={link.to === '/'}
              color="inherit"
              sx={{
                '&.active': { fontWeight: 700 },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Stack>
        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          {user?.email}
        </Typography>
        <Button color="inherit" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Log out
        </Button>
      </Toolbar>
    </AppBar>
  );
}
