import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Category } from '../types/category';
import type { Warehouse, WarehouseFormValues } from '../types/warehouse';
import type { Product, ProductFormValues } from '../types/product';
import type { StockPage, StockQuery, StocksApiResponse } from '../types/stock';
import type { Order, OrderApiItem, OrderPage, OrderQuery, OrdersApiResponse, OrderStatus, OrderType } from '../types/order';

// All HTTP calls to the API live in this file. Categories, warehouses and
// products are loaded once on mount and kept in state (other screens need the
// full lists for lookups and pickers). Stocks and orders are paged on the
// server (there can be thousands), so pages fetch them on demand through
// fetchStocks/fetchOrders/fetchOrder instead.

function toQueryString(query: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return params.toString();
}

const API_URL = 'http://localhost:5000';

function toOrder(item: OrderApiItem): Order {
  return {
    uid: item.uid,
    status: item.status,
    type: item.type,
    warehouseUid: item.warehouse.uid,
    created: item.created,
    items: item.items.map((i) => ({
      productUid: i.product.uid,
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  };
}

// Builds an Error from the API's ProblemDetails body so the UI can show why a
// request was rejected (e.g. "Insufficient stock ..."), not just the status.
async function apiError(response: Response, action: string): Promise<Error> {
  try {
    const body = await response.json();
    const messages = body.errors ? Object.values(body.errors as Record<string, string[]>).flat() : [];
    const detail = messages.length ? messages.join(' ') : body.detail;
    if (detail) return new Error(detail);
  } catch {
    // Body wasn't JSON - fall through to the generic message.
  }
  return new Error(`Failed to ${action}: ${response.status}`);
}

interface InventoryDataContextValue {
  categories: Category[];
  warehouses: Warehouse[];
  products: Product[];

  addCategory: (caption: string) => Promise<void>;

  addProduct: (values: ProductFormValues) => Promise<void>;
  updateProduct: (uid: string, values: ProductFormValues) => Promise<void>;
  deleteProduct: (uid: string) => Promise<void>;

  addWarehouse: (values: WarehouseFormValues) => Promise<void>;
  updateWarehouse: (uid: string, values: WarehouseFormValues) => Promise<void>;

  fetchStocks: (query: StockQuery) => Promise<StockPage>;
  adjustStock: (warehouseUid: string, productUid: string, newQuantity: number) => Promise<void>;

  fetchOrders: (query: OrderQuery) => Promise<OrderPage>;
  fetchOrder: (uid: string) => Promise<Order | null>;
  createOrder: (type: OrderType, warehouseUid: string) => Promise<string>;
  addOrderItem: (orderUid: string, productUid: string, quantity: number) => Promise<void>;
  removeOrderItem: (orderUid: string, productUid: string) => Promise<void>;
  changeOrderStatus: (orderUid: string, newStatus: OrderStatus) => Promise<void>;
}

const InventoryDataContext = createContext<InventoryDataContextValue | null>(null);

export function InventoryDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { getAccessTokenSilently } = useAuth0();

  // Every request carries the logged-in user's Auth0 access token; the API
  // checks the roles inside it.
  const apiFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    const token = await getAccessTokenSilently();
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
  }, [getAccessTokenSilently]);

  useEffect(()=> {
    const loadProducts = async ()=>{
    const response = await apiFetch(`/api/products`);

    if (!response.ok){
      throw new Error(`Failed to load products: ${response.status}`);
    }

    const data = await response.json();
    setProducts(data);
    };

    loadProducts().catch((err) => {
      console.error(err);
    });
  },[apiFetch])

  const addProduct = async (values: ProductFormValues) => {
  const response = await apiFetch(`/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Failed to add product: ${response.status}`);
  }

  const data = await response.json();
  setProducts((prev) => [...prev, { ...values, uid: data.uid }]);
};

const updateProduct = async (uid: string, values: ProductFormValues) => {
  const response = await apiFetch(`/api/products/${uid}`,{
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, ...values }),
  });

  if (!response.ok) {
  throw new Error(`Failed to update product: ${response.status}`);
}

setProducts((prev) => prev.map((p) => (p.uid === uid ? { ...p, ...values } : p)));
}

const deleteProduct = async (uid: string) => {
  const response = await apiFetch(`/api/products/${uid}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.status}`);
  }

  setProducts((prev) => prev.filter((p) => p.uid !== uid));
};

useEffect(()=> {
    const loadCategories = async ()=>{
    const response = await apiFetch(`/api/categories`);

    if (!response.ok){
      throw new Error(`Failed to load categories: ${response.status}`);
    }

    const data = await response.json();
    setCategories(data);
    };

    loadCategories().catch((err) => {
      console.error(err);
    });
  },[apiFetch])

  const addCategory = async (caption: string) => {
    const response = await apiFetch(`/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add category: ${response.status}`);
    }

    const created: Category = await response.json();
    setCategories((prev) => [...prev, created]);
  };
  useEffect(()=> {
    const loadWarehouses = async ()=>{
    const response = await apiFetch(`/api/warehouses`);

    if (!response.ok){
      throw new Error(`Failed to load warehouses: ${response.status}`);
    }

    const data = await response.json();
    setWarehouses(data);
    };

    loadWarehouses().catch((err) => {
      console.error(err);
    });
  },[apiFetch])

  const addWarehouse = async (values: WarehouseFormValues) => {
  const response = await apiFetch(`/api/warehouses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Failed to add warehouse: ${response.status}`);
  }

  const data = await response.json();
  setWarehouses((prev) => [...prev, { ...values, uid: data.uid }]);
};

  const updateWarehouse = async (uid: string, values: WarehouseFormValues) => {
  const response = await apiFetch(`/api/warehouses/${uid}`,{
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, ...values }),
  });

  if (!response.ok) {
  throw new Error(`Failed to update warehouse: ${response.status}`);
}

  setWarehouses((prev) => prev.map((w) => (w.uid === uid ? { ...w, ...values } : w)));
};

  const fetchStocks = useCallback(async (query: StockQuery): Promise<StockPage> => {
    const response = await apiFetch(`/api/stocks?${toQueryString(query)}`);

    if (!response.ok) {
      throw await apiError(response, 'load stocks');
    }

    const data: StocksApiResponse = await response.json();
    return {
      stocks: data.stocks.map((item) => ({
        warehouseUid: item.warehouse.uid,
        warehouseName: item.warehouse.name,
        productUid: item.product.uid,
        productName: item.product.name,
        quantity: item.quantity,
      })),
      totalCount: data.totalCount,
    };
  }, [apiFetch]);

  const adjustStock = async (warehouseUid: string, productUid: string, newQuantity: number) => {
    const response = await apiFetch(`/api/stocks/adjust`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ warehouseUid, productUid, newQuantity }),
    });

    if (!response.ok) {
      throw await apiError(response, 'adjust stock');
    }
  };

  // The fetch* functions only read from the API, so they keep a stable
  // identity and pages can safely list them as effect dependencies.
  const fetchOrders = useCallback(async (query: OrderQuery): Promise<OrderPage> => {
    const response = await apiFetch(`/api/orders?${toQueryString(query)}`);

    if (!response.ok) {
      throw await apiError(response, 'load orders');
    }

    const data: OrdersApiResponse = await response.json();
    return { orders: data.orders.map(toOrder), totalCount: data.totalCount };
  }, [apiFetch]);

  const fetchOrder = useCallback(async (uid: string): Promise<Order | null> => {
    const response = await apiFetch(`/api/orders/${uid}`);

    if (response.status === 404) return null;
    if (!response.ok) {
      throw await apiError(response, 'load order');
    }

    return toOrder(await response.json());
  }, [apiFetch]);

  const createOrder = async (type: OrderType, warehouseUid: string) => {
    const response = await apiFetch(`/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, warehouseUid }),
    });

    if (!response.ok) {
      throw await apiError(response, 'create order');
    }

    const uid: string = await response.json();
    return uid;
  };

  const addOrderItem = async (orderUid: string, productUid: string, quantity: number) => {
    const response = await apiFetch(`/api/orders/${orderUid}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderUid, productUid, quantity }),
    });

    if (!response.ok) {
      throw await apiError(response, 'add item');
    }
  };

  const removeOrderItem = async (orderUid: string, productUid: string) => {
    const response = await apiFetch(`/api/orders/${orderUid}/items/${productUid}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw await apiError(response, 'remove item');
    }
  };

  // Completing an order moves stock on the server (incoming adds, outgoing
  // subtracts); the Stock page fetches fresh data whenever it's opened.
  const changeOrderStatus = async (orderUid: string, newStatus: OrderStatus) => {
    const response = await apiFetch(`/api/orders/${orderUid}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderUid, newStatus }),
    });

    if (!response.ok) {
      throw await apiError(response, 'change order status');
    }
  };

  const value = useMemo<InventoryDataContextValue>(
    () => ({
      categories,
      warehouses,
      products,
      addCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      addWarehouse,
      updateWarehouse,
      fetchStocks,
      adjustStock,
      fetchOrders,
      fetchOrder,
      createOrder,
      addOrderItem,
      removeOrderItem,
      changeOrderStatus,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, warehouses, products],
  );

  return <InventoryDataContext.Provider value={value}>{children}</InventoryDataContext.Provider>;
}

export function useInventoryData() {
  const ctx = useContext(InventoryDataContext);
  if (!ctx) throw new Error('useInventoryData must be used within InventoryDataProvider');
  return ctx;
}
