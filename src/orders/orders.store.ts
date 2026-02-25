import { Injectable } from '@nestjs/common';
import { Order } from './interfaces/order.interface';

@Injectable()
export class OrdersStore {
  private readonly orders = new Map<string, Order>();

  save(order: Order): void {
    this.orders.set(order.id, order);
  }

  findAll(): Order[] {
    return Array.from(this.orders.values());
  }

  findById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  count(): number {
    return this.orders.size;
  }
}
