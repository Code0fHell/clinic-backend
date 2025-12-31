import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum FilterType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
}

export class QueryLabTestResultDto {
  @ApiProperty({
    required: false,
    enum: FilterType,
    description: 'Loại lọc: day (ngày), week (tuần), month (tháng), all (tất cả)',
    example: FilterType.DAY,
    default: FilterType.ALL,
  })
  @IsOptional()
  @IsEnum(FilterType, { message: 'filter_type phải là day, week, month hoặc all' })
  filter_type?: FilterType = FilterType.ALL;

  @ApiProperty({
    required: false,
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page phải lớn hơn hoặc bằng 1' })
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Số lượng kết quả mỗi trang',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1' })
  @Max(100, { message: 'limit không được vượt quá 100' })
  limit?: number = 10;
}


