import { Auth0Provider } from '@auth0/auth0-react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './theme/theme';
import { InventoryDataProvider } from './context/InventoryDataContext';
import { CurrentUserProvider, useCurrentUser } from './context/CurrentUserContext';
import { AppHeader } from './components/organisms/AppHeader';
import { AuthGate } from './components/organisms/AuthGate';
import { AccessGate } from './components/organisms/AccessGate';
import { Dashboard } from './pages/Dashboard';
import { Warehouses } from './pages/Warehouses';
import { StockPage } from './pages/Stock';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Users } from './pages/Users';

// Public Auth0 settings (not secrets). The audience must match Auth0:Audience in the API.
const AUTH0_DOMAIN = 'dev-az6cdba8l01vtl8a.eu.auth0.com';
const AUTH0_CLIENT_ID = 'dR7vzex2iFijPHTDWyq6vhifw9LbTFut';
const AUTH0_AUDIENCE = 'https://inventory-management-api';

function App() {
  // cacheLocation="localstorage" keeps the login across page reloads; the
  // default in-memory cache relies on third-party cookies, which browsers block.
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin, audience: AUTH0_AUDIENCE }}
      cacheLocation="localstorage"
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthGate>
          <CurrentUserProvider>
            {/* The data provider loads warehouses etc. on mount, so it only
                mounts once the user has a role and the API will answer. */}
            <AccessGate>
              <InventoryDataProvider>
                <BrowserRouter>
                  <AppHeader />
                  <AppRoutes />
                </BrowserRouter>
              </InventoryDataProvider>
            </AccessGate>
          </CurrentUserProvider>
        </AuthGate>
      </ThemeProvider>
    </Auth0Provider>
  );
}

function AppRoutes() {
  const { canManageUsers } = useCurrentUser();

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/warehouses" element={<Warehouses />} />
      <Route path="/stock" element={<StockPage />} />
      <Route path="/products" element={<Products />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:uid" element={<OrderDetail />} />
      {canManageUsers && <Route path="/users" element={<Users />} />}
    </Routes>
  );
}

export default App;
