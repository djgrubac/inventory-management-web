export interface Stock {
  warehouseUid: string;
  warehouseName: string;
  productUid: string;
  productName: string;
  quantity: number;
}

export interface StockQuery {
  warehouseUid?: string;
  productUid?: string;
  categoryUid?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface StockPage {
  stocks: Stock[];
  totalCount: number;
}

export interface StockApiItem {
  warehouse: { uid: string; name: string };
  product: { uid: string; name: string };
  quantity: number;
}

export interface StocksApiResponse {
  stocks: StockApiItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}
