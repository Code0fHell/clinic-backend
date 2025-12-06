import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { ServiceType } from '../../../shared/enums/service-type.enum';

export class UpdateMedicalServiceDto {
  @ApiPropertyOptional({
    example: 'Xét nghiệm máu tổng quát',
    description: 'Tên dịch vụ y tế (tùy chọn)',
  })
  @IsOptional()
  @IsString({ message: 'Tên dịch vụ phải là chuỗi' })
  service_name?: string;

  @ApiPropertyOptional({
    example: 'Xét nghiệm máu tổng quát để kiểm tra các chỉ số sức khỏe cơ bản',
    description: 'Mô tả dịch vụ y tế (tùy chọn)',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiPropertyOptional({
    enum: ServiceType,
    example: ServiceType.TEST,
    description: 'Loại dịch vụ (tùy chọn)',
  })
  @IsOptional()
  @IsEnum(ServiceType, { message: 'Loại dịch vụ không hợp lệ' })
  service_type?: ServiceType;

  @ApiPropertyOptional({
    example: 150000,
    description: 'Giá dịch vụ mới (tùy chọn)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Giá dịch vụ phải là số' })
  @IsPositive({ message: 'Giá dịch vụ phải lớn hơn 0' })
  service_price?: number;

  @ApiPropertyOptional({
    example: 'b12345c0-6a21-4f1c-ae9d-9b99f2e3cc77',
    description: 'ID phòng mới (tùy chọn)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID phòng không hợp lệ' })
  room_id?: string;
}
