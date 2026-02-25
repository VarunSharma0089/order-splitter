import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersStore } from './orders.store';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule,                                        
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]) 
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersStore,
  ],
})
export class OrdersModule {}