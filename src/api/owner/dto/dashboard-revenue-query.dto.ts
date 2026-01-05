import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum Timeframe {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
}

export class DashboardRevenueQueryDto {
  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Timeframe for grouping data',
    enum: Timeframe,
    example: Timeframe.DAY,
  })
  @IsEnum(Timeframe)
  timeframe: Timeframe;
}

