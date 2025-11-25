import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  Min,
  IsInt,
  IsDateString,
} from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({
    description: 'Tên thuốc',
    example: 'Paracetamol 500mg',
  })
  @IsString({ message: 'Tên thuốc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên thuốc không được để trống' })
  name: string;

  @ApiProperty({
    description: 'Mô tả hoặc hướng dẫn sử dụng',
    required: false,
    example: 'Thuốc hạ sốt, giảm đau, dùng theo chỉ định của bác sĩ',
  })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Giá bán của thuốc (VNĐ)',
    example: 15000,
  })
  @IsNumber({}, { message: 'Giá thuốc phải là số' })
  @Min(0, { message: 'Giá thuốc phải lớn hơn hoặc bằng 0' })
  price: number;

  @ApiProperty({
    description: 'Danh mục thuốc (ví dụ: Kháng sinh, Giảm đau, Hạ sốt...)',
    required: false,
    example: 'Hạ sốt',
  })
  @IsString({ message: 'Danh mục phải là chuỗi' })
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Đơn vị tính (ví dụ: viên, hộp, lọ...)',
    required: false,
    example: 'Viên',
  })
  @IsString({ message: 'Đơn vị tính phải là chuỗi' })
  @IsOptional()
  unit?: string;

  @ApiProperty({
    description: 'Số lượng tồn kho',
    example: 100,
  })
  @IsInt({ message: 'Tồn kho phải là số nguyên' })
  @Min(0, { message: 'Số lượng tồn kho không được âm' })
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Nhà sản xuất thuốc',
    required: false,
    example: 'Traphaco',
  })
  @IsString({ message: 'Tên nhà sản xuất phải là chuỗi' })
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({
    description: 'Ngày hết hạn (định dạng ISO 8601)',
    required: false,
    example: '2026-12-31',
  })
  @IsDateString({}, { message: 'Ngày hết hạn phải là định dạng ngày hợp lệ' })
  @IsOptional()
  expiry_date?: string;
}
