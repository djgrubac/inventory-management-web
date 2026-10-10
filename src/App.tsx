import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './theme/theme';
import { InventoryDataProvider } from './context/InventoryDataContext';
import { AppHeader } from './components/organisms/AppHeader';
import { Dashboard } from './pages/Dashboard';
import { Warehouses } from './pages/Warehouses';
import { StockPage } from './pages/Stock';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <InventoryDataProvider>
        <BrowserRouter>
          <AppHeader />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:uid" element={<OrderDetail />} />
          </Routes>
        </BrowserRouter>
      </InventoryDataProvider>
    </ThemeProvider>
  );
}

export default App;
