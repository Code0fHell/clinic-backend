import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsOptional, IsNotEmpty, } from 'class-validator';
import { BillType } from '../../../shared/enums/bill-type.enum';

export class CreateBillDto {
  @ApiProperty({
    enum: BillType,
    description: 'Loại hóa đơn (CLINICAL, SERVICE, MEDICINE, ...)',
    example: 'CLINICAL',
  })
  @IsEnum(BillType, { message: 'bill_type không hợp lệ' })
  @IsNotEmpty({ message: 'bill_type là bắt buộc' })
  bill_type: BillType;

  @ApiProperty({
    description: 'ID của bệnh nhân liên quan đến hóa đơn',
    example: 'a56d3e9f-17c2-4e2f-b5a9-39d24f8c95aa',
  })
  @IsUUID('4', { message: 'patient_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'patient_id là bắt buộc' })
  patient_id: string;

  @ApiPropertyOptional({
    description: 'ID của bác sĩ (nếu có)',
    example: '1b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
  })
  @IsOptional()
  @IsUUID('4', { message: 'doctor_id phải là UUID hợp lệ' })
  doctor_id?: string;

  @ApiPropertyOptional({
    description: 'ID của phiếu khám (nếu hóa đơn thuộc loại CLINICAL)',
    example: 'cb0a10a1-939c-4724-88b2-7b74c556a9e9',
  })
  @IsOptional()
  @IsUUID('4', { message: 'medical_ticket_id phải là UUID hợp lệ' })
  medical_ticket_id?: string;

  @ApiPropertyOptional({
    description: 'ID của phiếu chỉ định (nếu hóa đơn thuộc loại SERVICE)',
    example: '4a9b1e60-efad-4d89-832f-d1267302acb8',
  })
  @IsOptional()
  @IsUUID('4', { message: 'indication_ticket_id phải là UUID hợp lệ' })
  indication_ticket_id?: string;

  @ApiPropertyOptional({
    description: 'ID của đơn thuốc (nếu hóa đơn thuộc loại MEDICINE)',
    example: '36d8a4f3-6f4b-4b2b-b0e8-df13bc56e25c',
  })
  @IsOptional()
  @IsUUID('4', { message: 'prescription_id phải là UUID hợp lệ' })
  prescription_id?: string;
}
