import { Controller, Post, Get, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OrdersService }   from './orders.service';
import { CreateOrderDto }  from './dto/create-order.dto';
import { ApiKeyGuard }     from '../common/guards/api-key.guard';

@ApiTags('Orders')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Split a portfolio order into individual stock orders' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created with stock breakdown and execution schedule' })
  @ApiResponse({ status: 400, description: 'Validation error — e.g. weights do not sum to 100' })
  @ApiResponse({ status: 401, description: 'Missing or invalid x-api-key header' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all historic orders (in-memory — cleared on restart)' })
  @ApiResponse({ status: 200, description: 'Array of all historic orders' })
  @ApiResponse({ status: 401, description: 'Missing or invalid x-api-key header' })
  getHistoricOrders() {
    return this.ordersService.getHistoricOrders();
  }
}
