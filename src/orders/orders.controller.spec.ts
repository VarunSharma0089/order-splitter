import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersStore } from './orders.store';
import { ConfigService } from '@nestjs/config';
import { OrderType } from './dto/create-order.dto';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

const mockConfig = {
  get: (key: string) => ({ shareDecimalPlaces: 3, fixedStockPrice: 100 }[key]),
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
      ],
      controllers: [OrdersController],
      providers: [
        OrdersService,
        OrdersStore,
        { provide: ConfigService, useValue: mockConfig },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    })
      .overrideGuard(ThrottlerGuard) 
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service    = module.get<OrdersService>(OrdersService);
  });

  //POST /orders

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an order and return it', () => {
    const dto = {
      portfolio: [
        { ticker: 'AAPL', weight: 60 },
        { ticker: 'TSLA', weight: 40 },
      ],
      totalAmount: 100,
      orderType: OrderType.BUY,
    };

    const result = controller.createOrder(dto as any);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('executeAt');
    expect(result).toHaveProperty('processingTimeMs');
    expect(result.stocks).toHaveLength(2);
    expect(result.stocks[0].ticker).toBe('AAPL');
    expect(result.stocks[0].allocatedAmount).toBe(60);
    expect(result.stocks[0].quantity).toBe(0.6);
  });

  it('should create a SELL order correctly', () => {
    const result = controller.createOrder({
      portfolio: [{ ticker: 'TSLA', weight: 100 }],
      totalAmount: 500,
      orderType: OrderType.SELL,
    } as any);

    expect(result.orderType).toBe('SELL');
    expect(result.stocks[0].allocatedAmount).toBe(500);
    expect(result.stocks[0].quantity).toBe(5); 
  });

  it('should use partner marketPrice when provided', () => {
    const result = controller.createOrder({
      portfolio: [{ ticker: 'AAPL', weight: 100, marketPrice: 200 }],
      totalAmount: 100,
      orderType: OrderType.BUY,
    } as any);

    expect(result.stocks[0].quantity).toBe(0.5);  
    expect(result.stocks[0].priceUsed).toBe(200);
  });

  it('should delegate to OrdersService.createOrder', () => {
    const spy = jest.spyOn(service, 'createOrder');

    controller.createOrder({
      portfolio: [{ ticker: 'AAPL', weight: 100 }],
      totalAmount: 100,
      orderType: OrderType.BUY,
    } as any);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  //GET /orders 

  it('should return an empty array when no orders exist', () => {
    const result = controller.getHistoricOrders();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('should return all historic orders', () => {
    controller.createOrder({
      portfolio: [{ ticker: 'AAPL', weight: 100 }],
      totalAmount: 100,
      orderType: OrderType.BUY,
    } as any);

    controller.createOrder({
      portfolio: [{ ticker: 'TSLA', weight: 100 }],
      totalAmount: 200,
      orderType: OrderType.SELL,
    } as any);

    const result = controller.getHistoricOrders();
    expect(result).toHaveLength(2);
  });

  it('should delegate to OrdersService.getHistoricOrders', () => {
    const spy = jest.spyOn(service, 'getHistoricOrders');
    controller.getHistoricOrders();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});