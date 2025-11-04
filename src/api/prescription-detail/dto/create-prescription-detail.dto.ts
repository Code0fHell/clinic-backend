import { IsString, IsOptional, IsNumber, IsUUID, Min, IsNotEmpty, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionDetailDto {
  @ApiProperty({
    description: 'ID của đơn thuốc (Prescription)',
    example: 'a6f15b09-3f4d-4bc9-b9e4-2a73597f2b01',
  })
  @IsUUID('4', { message: 'prescription_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'prescription_id không được để trống' })
  prescription_id: string;

  @ApiProperty({
    description: 'ID của thuốc (Medicine)',
    example: 'fd1e3b45-99af-4a0e-b832-1f66a4bc1ad2',
  })
  @IsUUID('4', { message: 'medicine_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'medicine_id không được để trống' })
  medicine_id: string;

  @ApiProperty({
    description: 'Số lượng thuốc kê trong đơn',
    example: 2,
  })
  @IsNumber({}, { message: 'quantity phải là số hợp lệ' })
  @Min(1, { message: 'quantity phải ít nhất là 1' })
  quantity: number;

  @ApiProperty({
    description: 'Hướng dẫn sử dụng thuốc (nếu có)',
    required: false,
    example: 'Uống 2 viên mỗi ngày sau bữa ăn sáng và tối',
  })
  @IsString({ message: 'dosage phải là chuỗi ký tự' })
  @IsOptional()
  dosage?: string;
}
