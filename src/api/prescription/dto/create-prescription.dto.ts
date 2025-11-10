import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, Min, IsNotEmpty, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'ID của bệnh nhân',
    example: 'f1a4c03a-8a87-4a3e-9c3a-91a3f0cc7a1b',
  })
  @IsUUID('4', { message: 'patient_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'patient_id không được để trống' })
  patient_id: string;

  @ApiProperty({
    description: 'ID của bác sĩ kê đơn',
    example: '0bc1f00d-57a6-442f-90de-0a4c27b6cc4f',
  })
  @IsUUID('4', { message: 'doctor_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'doctor_id không được để trống' })
  doctor_id: string;

  @ApiProperty({
    description: 'Kết luận của đơn thuốc (nếu có)',
    required: false,
    example: 'Theo dõi thêm sau 7 ngày',
  })
  @IsString({ message: 'Conclusion phải là chuỗi ký tự' })
  @IsOptional()
  conclusion?: string;

  @ApiProperty({
    description: 'Tổng chi phí của đơn thuốc (VNĐ)',
    example: 250000,
  })
  @IsNumber({}, { message: 'total_fee phải là số' })
  @Min(0, { message: 'total_fee phải lớn hơn hoặc bằng 0' })
  total_fee: number;

  @ApiProperty({
    description: 'Ngày hẹn tái khám (ISO 8601, ví dụ: 2025-11-10T00:00:00Z)',
    required: false,
    example: '2025-11-10T08:30:00.000Z',
  })
  @IsDateString({}, { message: 'return_date phải là chuỗi ngày hợp lệ (ISO 8601)' })
  @IsOptional()
  return_date?: string;

  @ApiProperty({
    description: 'ID của hồ sơ bệnh án liên quan (nếu có)',
    required: false,
    example: '9cf9ab67-1e22-4f9b-9271-43cfa7a76f56',
  })
  @IsUUID('4', { message: 'medical_record_id phải là UUID hợp lệ' })
  @IsOptional()
  medical_record_id?: string;
}
