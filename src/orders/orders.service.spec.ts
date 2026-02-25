import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService }       from '@nestjs/config';
import { OrdersService }       from './orders.service';
import { OrdersStore }         from './orders.store';
import { OrderType }           from './dto/create-order.dto';

const mockConfig = { get: (key: string) => ({ shareDecimalPlaces: 3, fixedStockPrice: 100 }[key]) };

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService, OrdersStore,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
  });

  it('should split $100 into AAPL 60% + TSLA 40% at $100 fixed price', () => {
    const result = service.createOrder({
      portfolio: [{ ticker:'AAPL', weight:60 }, { ticker:'TSLA', weight:40 }],
      totalAmount: 100, orderType: OrderType.BUY,
    });
    expect(result.stocks[0].allocatedAmount).toBe(60);
    expect(result.stocks[0].quantity).toBe(0.6);
    expect(result.stocks[1].allocatedAmount).toBe(40);
    expect(result.stocks[1].quantity).toBe(0.4);
  });

  it('should use partner marketPrice over fixed price', () => {
    const result = service.createOrder({
      portfolio: [{ ticker:'AAPL', weight:100, marketPrice:200 }],
      totalAmount: 100, orderType: OrderType.BUY,
    });
    expect(result.stocks[0].quantity).toBe(0.5); 
    expect(result.stocks[0].priceUsed).toBe(200);
  });

  it('should schedule execution on a weekday Mon–Fri', () => {
    const result = service.createOrder({
      portfolio: [{ ticker:'TSLA', weight:100 }],
      totalAmount: 500, orderType: OrderType.SELL,
    });
    const day = new Date(result.executeAt).getUTCDay();
    expect(day).toBeGreaterThanOrEqual(1);  
    expect(day).toBeLessThanOrEqual(5);    
  });

  it('should persist orders and retrieve them as history', () => {
    service.createOrder({ portfolio:[{ticker:'AAPL',weight:100}], totalAmount:500, orderType:OrderType.BUY });
    service.createOrder({ portfolio:[{ticker:'TSLA',weight:100}], totalAmount:200, orderType:OrderType.SELL });
    expect(service.getHistoricOrders().length).toBe(2);
  });

  it('should include processingTimeMs in response', () => {
    const result = service.createOrder({
      portfolio: [{ ticker:'AAPL', weight:100 }],
      totalAmount: 100, orderType: OrderType.BUY,
    });
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should generate unique IDs for each order', () => {
    const o1 = service.createOrder({ portfolio:[{ticker:'AAPL',weight:100}], totalAmount:100, orderType:OrderType.BUY });
    const o2 = service.createOrder({ portfolio:[{ticker:'AAPL',weight:100}], totalAmount:100, orderType:OrderType.BUY });
    expect(o1.id).not.toBe(o2.id);
  });
});
