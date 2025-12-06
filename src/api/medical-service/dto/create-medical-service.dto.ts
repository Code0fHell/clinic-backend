import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { ServiceType } from '../../../shared/enums/service-type.enum';

export class CreateMedicalServiceDto {
  @ApiProperty({
    example: 'X-quang ngực thẳng',
    description: 'Tên dịch vụ y tế',
  })
  @IsNotEmpty({ message: 'Tên dịch vụ không được để trống' })
  @IsString({ message: 'Tên dịch vụ phải là chuỗi' })
  service_name: string;

  @ApiProperty({
    example: 'Chụp X-quang ngực thẳng để chẩn đoán các bệnh lý về phổi và tim',
    description: 'Mô tả dịch vụ y tế',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({
    enum: ServiceType,
    example: ServiceType.IMAGING,
    description: 'Loại dịch vụ (EXAMINATION, TEST, IMAGING, OTHER)',
  })
  @IsNotEmpty({ message: 'Loại dịch vụ là bắt buộc' })
  @IsEnum(ServiceType, { message: 'Loại dịch vụ không hợp lệ' })
  service_type: ServiceType;

  @ApiProperty({
    example: 200000,
    description: 'Giá dịch vụ (đơn vị: VNĐ)',
  })
  @IsNotEmpty({ message: 'Giá dịch vụ không được để trống' })
  @IsNumber({}, { message: 'Giá dịch vụ phải là số' })
  @IsPositive({ message: 'Giá dịch vụ phải lớn hơn 0' })
  service_price: number;

  @ApiProperty({
    example: '4cc072b0-7c49-4345-8e26-7bee7db40e81',
    description: 'ID của phòng thực hiện dịch vụ',
  })
  @IsNotEmpty({ message: 'Phòng thực hiện là bắt buộc' })
  @IsUUID('4', { message: 'ID phòng không hợp lệ' })
  room_id: string;
}
