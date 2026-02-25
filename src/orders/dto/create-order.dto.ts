import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, ValidateNested, Min, registerDecorator,
         ValidationOptions, ValidationArguments } from 'class-validator';
import { Type } from 'class-transformer';
import { StockDto } from './stock.dto';

export enum OrderType { BUY = 'BUY', SELL = 'SELL' }

function WeightsSumTo100(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'weightsSumTo100',
      target: (object as any).constructor,
      propertyName,
      options: { message: 'Portfolio weights must sum to 100', ...validationOptions },
      validator: {
        validate(value: StockDto[]) {
          if (!Array.isArray(value)) return false;
          const sum = value.reduce((acc, s) => acc + (s.weight || 0), 0);
          return Math.abs(sum - 100) < 0.001; 
        },
      },
    });
  };
}

export class CreateOrderDto {
  @ApiProperty({ type: [StockDto], description: 'Stocks with weights that must sum to 100', example: [
      { ticker: 'AAPL', weight: 60, marketPrice: 185.5 },
      { ticker: 'TSLA', weight: 40, marketPrice: 250.0 }
    ] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockDto)
  @WeightsSumTo100()
  portfolio: StockDto[];

  @ApiProperty({ example: 100, description: 'Total investment amount in USD' })
  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @ApiProperty({ enum: OrderType, example: OrderType.BUY })
  @IsEnum(OrderType)
  orderType: OrderType;
}
