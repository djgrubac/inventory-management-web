export interface Stock {
  warehouseUid: string;
  productUid: string;
  quantity: number;
}

export interface StockApiItem {
  warehouse: { uid: string };
  product: { uid: string };
  quantity: number;
}

export interface StocksApiResponse {
  stocks: StockApiItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}
