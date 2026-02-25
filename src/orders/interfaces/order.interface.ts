export interface StockOrder {
  ticker:          string;
  allocatedAmount: number;
  quantity:        number;
  priceUsed:       number;
}

export interface Order {
  id:                string;
  orderType:         'BUY' | 'SELL';
  totalAmount:       number;
  stocks:            StockOrder[];
  executeAt:         string;   
  createdAt:         string; 
  processingTimeMs:  number;
}
