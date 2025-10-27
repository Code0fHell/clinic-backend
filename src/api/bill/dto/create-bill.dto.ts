import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillType } from '../../../shared/enums/bill-type.enum';

export class CreateBillDto {
  @ApiProperty({ enum: BillType })
  bill_type: BillType;

  @ApiProperty()
  patient_id: string;

  @ApiPropertyOptional()
  doctor_id?: string;

  @ApiPropertyOptional()
  medical_ticket_id?: string;

  @ApiPropertyOptional()
  indication_ticket_id?: string;

  @ApiPropertyOptional()
  prescription_id?: string;
}