import { Injectable, Logger } from '@nestjs/common';
import { ConfigService }      from '@nestjs/config';
import { v4 as uuidv4 }       from 'uuid';
import { CreateOrderDto }     from './dto/create-order.dto';
import { OrdersStore }        from './orders.store';
import { Order, StockOrder }  from './interfaces/order.interface';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly store:  OrdersStore,
    private readonly config: ConfigService,
  ) {}

  createOrder(dto: CreateOrderDto): Order {
    const start = Date.now();
    const decimalPlaces = this.config.get<number>('shareDecimalPlaces') ?? 3;
    const fixedPrice    = this.config.get<number>('fixedStockPrice')    ?? 100;

    const stocks: StockOrder[] = dto.portfolio.map(stock => {
      const price      = stock.marketPrice ?? fixedPrice;
      const allocated  = parseFloat(((stock.weight / 100) * dto.totalAmount).toFixed(10));
      const quantity   = parseFloat((allocated / price).toFixed(decimalPlaces));
      return { ticker: stock.ticker, allocatedAmount: allocated, quantity, priceUsed: price };
    });

    const order: Order = {
      id:               uuidv4(),
      orderType:        dto.orderType,
      totalAmount:      dto.totalAmount,
      stocks,
      executeAt:        this.getNextMarketOpen().toISOString(),
      createdAt:        new Date().toISOString(),
      processingTimeMs: Date.now() - start,
    };

    this.store.save(order);
    this.logger.log(`Order ${order.id} created in ${order.processingTimeMs}ms [${order.orderType}]`);
    return order;
  }

  getHistoricOrders(): Order[] {
    const start  = Date.now();
    const orders = this.store.findAll();
    this.logger.log(`Fetched ${orders.length} historic orders in ${Date.now() - start}ms`);
    return orders;
  }

  private getNextMarketOpen(): Date {
    const now = new Date();
    const day = now.getUTCDay();
    const daysAhead = day === 6 ? 2 : day === 0 ? 1 : 0;
    const next = new Date(now);
    next.setUTCDate(now.getUTCDate() + daysAhead);
    next.setUTCHours(14, 30, 0, 0);  
 
    if (daysAhead === 0 && now.getUTCHours() >= 21) {
      const nextDay = next.getUTCDay();
      next.setUTCDate(next.getUTCDate() + (nextDay === 5 ? 3 : 1));
    }
    return next;
  }
}
