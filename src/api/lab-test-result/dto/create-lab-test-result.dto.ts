import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceTestResultDto {
  @ApiProperty({
    description: 'ID của service indication',
    example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  })
  @IsUUID('4', { message: 'service_indication_id phải là UUID hợp lệ' })
  service_indication_id: string;

  @ApiProperty({
    description: 'Kết quả xét nghiệm cho service này (giá trị đo được)',
    example: 8.5,
  })
  @IsNumber({}, { message: 'test_result phải là số' })
  test_result: number;
}

export class CreateLabTestResultDto {
  @ApiProperty({
    description: 'ID của phiếu chỉ định (indication ticket)',
    example: 'e45b12a3-6d4a-4e91-9a9b-7b6e4a8f9c2a',
  })
  @IsUUID('4', { message: 'indication_id phải là UUID hợp lệ' })
  indication_id: string;

  @ApiProperty({
    description: 'ID của bệnh nhân',
    example: 'ff360204-61f9-4df9-9e0a-bf84022799c1',
  })
  @IsUUID('4', { message: 'patient_id phải là UUID hợp lệ' })
  patient_id: string;

  @ApiProperty({
    type: [ServiceTestResultDto],
    description: 'Danh sách kết quả xét nghiệm cho từng service',
  })
  @IsArray({ message: 'service_results phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => ServiceTestResultDto)
  service_results: ServiceTestResultDto[];

  @ApiProperty({
    required: false,
    description: 'Kết luận tổng quát xét nghiệm từ nhân viên lab',
    example: 'Các chỉ số trong giới hạn bình thường',
  })
  @IsString({ message: 'conclusion phải là chuỗi ký tự' })
  @IsOptional()
  conclusion?: string;
}

