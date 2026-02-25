import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class StockDto {
  @ApiProperty({ example: 'AAPL', description: 'Stock ticker symbol' })
  @IsString()
  ticker: string;

  @ApiProperty({ example: 60, description: 'Portfolio weight percentage (0-100)' })
  @IsNumber()
  @Min(0) @Max(100)
  weight: number;

  @ApiPropertyOptional({ example: 185.50, description: 'Market price — overrides fixed $100' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  marketPrice?: number;
}
