import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsNotEmpty, Min, } from 'class-validator';

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
    example: 'Thuốc hạ sốt, giảm đau',
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
    description: 'Nhà sản xuất thuốc',
    required: false,
    example: 'Traphaco',
  })
  @IsString({ message: 'Tên nhà sản xuất phải là chuỗi' })
  @IsOptional()
  manufacturer?: string;
}
