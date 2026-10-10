import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { sampleCategories, sampleWarehouses, sampleProducts, sampleStocks, sampleOrders } from '../data/sampleData';
import type { Category } from '../types/category';
import type { Warehouse, WarehouseFormValues } from '../types/warehouse';
import type { Product, ProductFormValues } from '../types/product';
import type { Stock, StocksApiResponse } from '../types/stock';
import { OrderStatus, OrderType, type Order } from '../types/order';
// import { ReportSharp } from '@mui/icons-material';

// This is a design mockup: everything below lives only in memory (React state).
// There is no server and no HTTP calls anywhere in this file or the rest of
// the app - refreshing the page resets all data back to the samples above.
//
// When you're ready to connect a real backend, this is the one file to
// change: keep the function names/signatures the same, but replace each
// function body with a fetch call to your API instead of a setState update.

interface InventoryDataContextValue {
  categories: Category[];
  warehouses: Warehouse[];
  products: Product[];
  stocks: Stock[];
  orders: Order[];

  addCategory: (caption: string) => Promise<void>;

  addProduct: (values: ProductFormValues) => Promise<void>;
  updateProduct: (uid: string, values: ProductFormValues) => Promise<void>;
  deleteProduct: (uid: string) => Promise<void>;

  addWarehouse: (values: WarehouseFormValues) => Promise<void>;
  updateWarehouse: (uid: string, values: WarehouseFormValues) => Promise<void>;

  adjustStock: (warehouseUid: string, productUid: string, newQuantity: number) => Promise<void>;

  createOrder: (type: OrderType, warehouseUid: string) => string;
  addOrderItem: (orderUid: string, productUid: string, quantity: number) => void;
  removeOrderItem: (orderUid: string, productUid: string) => void;
  changeOrderStatus: (orderUid: string, newStatus: OrderStatus) => void;
}

const InventoryDataContext = createContext<InventoryDataContextValue | null>(null);

export function InventoryDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(sampleWarehouses);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [stocks, setStocks] = useState<Stock[]>(sampleStocks);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  useEffect(()=> {
    const loadProducts = async ()=>{
    const response = await fetch('http://localhost:5000/api/products');

    if (!response.ok){
      throw new Error(`Failed to load products: ${response.status}`);
    }

    const data = await response.json();
    setProducts(data);
    };

    loadProducts().catch((err) => {
      console.error(err);
    });
  },[])

  const addProduct = async (values: ProductFormValues) => {
  const response = await fetch('http://localhost:5000/api/products', {
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
  const response = await fetch(`http://localhost:5000/api/products/${uid}`,{
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
  const response = await fetch(`http://localhost:5000/api/products/${uid}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.status}`);
  }

  setProducts((prev) => prev.filter((p) => p.uid !== uid));
};

useEffect(()=> {
    const loadCategories = async ()=>{
    const response = await fetch('http://localhost:5000/api/categories');

    if (!response.ok){
      throw new Error(`Failed to load categories: ${response.status}`);
    }

    const data = await response.json();
    setCategories(data);
    };

    loadCategories().catch((err) => {
      console.error(err);
    });
  },[])

  const addCategory = async (caption: string) => {
    const response = await fetch('http://localhost:5000/api/categories', {
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
    const response = await fetch('http://localhost:5000/api/warehouses');

    if (!response.ok){
      throw new Error(`Failed to load warehouses: ${response.status}`);
    }

    const data = await response.json();
    setWarehouses(data);
    };

    loadWarehouses().catch((err) => {
      console.error(err);
    });
  },[])

  const addWarehouse = async (values: WarehouseFormValues) => {
  const response = await fetch('http://localhost:5000/api/warehouses', {
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
  const response = await fetch(`http://localhost:5000/api/warehouses/${uid}`,{
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, ...values }),
  });

  if (!response.ok) {
  throw new Error(`Failed to update warehouse: ${response.status}`);
}

  setWarehouses((prev) => prev.map((w) => (w.uid === uid ? { ...w, ...values } : w)));
};

  useEffect(() => {
    const loadStocks = async () => {
      // The API pages results (default 10 per page), so ask for a large page.
      const response = await fetch('http://localhost:5000/api/stocks?pageSize=1000');

      if (!response.ok) {
        throw new Error(`Failed to load stocks: ${response.status}`);
      }

      const data: StocksApiResponse = await response.json();
      setStocks(
        data.stocks.map((item) => ({
          warehouseUid: item.warehouse.uid,
          productUid: item.product.uid,
          quantity: item.quantity,
        })),
      );
    };

    loadStocks().catch((err) => {
      console.error(err);
    });
  }, []);

  const adjustStock = async (warehouseUid: string, productUid: string, newQuantity: number) => {
    const response = await fetch('http://localhost:5000/api/stocks/adjust', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ warehouseUid, productUid, newQuantity }),
    });

    if (!response.ok) {
      throw new Error(`Failed to adjust stock: ${response.status}`);
    }

    setStocks((prev) => {
      const existing = prev.find((s) => s.warehouseUid === warehouseUid && s.productUid === productUid);
      if (existing) {
        return prev.map((s) =>
          s.warehouseUid === warehouseUid && s.productUid === productUid ? { ...s, quantity: newQuantity } : s,
        );
      }
      return [...prev, { warehouseUid, productUid, quantity: newQuantity }];
    });
  };

  const createOrder = (type: OrderType, warehouseUid: string) => {
    const uid = crypto.randomUUID();
    setOrders((prev) => [...prev, { uid, status: OrderStatus.Pending, type, warehouseUid, items: [], created: new Date().toISOString() }]);
    return uid;
  };

  const addOrderItem = (orderUid: string, productUid: string, quantity: number) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.uid !== orderUid) return order;
        const existingItem = order.items.find((i) => i.productUid === productUid);
        const product = products.find((p) => p.uid === productUid);
        if (existingItem) {
          return {
            ...order,
            items: order.items.map((i) => (i.productUid === productUid ? { ...i, quantity: i.quantity + quantity } : i)),
          };
        }
        return {
          ...order,
          items: [...order.items, { productUid, quantity, unitPrice: product?.price ?? 0 }],
        };
      }),
    );
  };

  const removeOrderItem = (orderUid: string, productUid: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.uid === orderUid ? { ...order, items: order.items.filter((i) => i.productUid !== productUid) } : order,
      ),
    );
  };

  // Mirrors the backend rule: completing an order moves stock at the
  // order's warehouse - incoming orders add to stock, outgoing orders
  // subtract from it.
  const changeOrderStatus = (orderUid: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.uid === orderUid);
    if (!order) return;

    if (newStatus === OrderStatus.Completed) {
      const direction = order.type === OrderType.Incoming ? 1 : -1;
      setStocks((prev) => {
        let next = prev;
        for (const item of order.items) {
          const existing = next.find((s) => s.warehouseUid === order.warehouseUid && s.productUid === item.productUid);
          if (existing) {
            next = next.map((s) =>
              s.warehouseUid === order.warehouseUid && s.productUid === item.productUid
                ? { ...s, quantity: Math.max(0, s.quantity + direction * item.quantity) }
                : s,
            );
          } else if (direction > 0) {
            next = [...next, { warehouseUid: order.warehouseUid, productUid: item.productUid, quantity: item.quantity }];
          }
        }
        return next;
      });
    }

    setOrders((prev) => prev.map((o) => (o.uid === orderUid ? { ...o, status: newStatus } : o)));
  };

  const value = useMemo<InventoryDataContextValue>(
    () => ({
      categories,
      warehouses,
      products,
      stocks,
      orders,
      addCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      addWarehouse,
      updateWarehouse,
      adjustStock,
      createOrder,
      addOrderItem,
      removeOrderItem,
      changeOrderStatus,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, warehouses, products, stocks, orders],
  );

  return <InventoryDataContext.Provider value={value}>{children}</InventoryDataContext.Provider>;
}

export function useInventoryData() {
  const ctx = useContext(InventoryDataContext);
  if (!ctx) throw new Error('useInventoryData must be used within InventoryDataProvider');
  return ctx;
}
