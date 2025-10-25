import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'The ID of the patient' })
  @IsUUID()
  patient_id: string;

  @ApiProperty({ description: 'The ID of the doctor' })
  @IsUUID()
  doctor_id: string;

  @ApiProperty({ description: 'The conclusion of the prescription', required: false })
  @IsString()
  @IsOptional()
  conclusion?: string;

  @ApiProperty({ description: 'The total fee of the prescription' })
  @IsNumber()
  @Min(0)
  total_fee: number;

  @ApiProperty({ description: 'The return date for follow-up', required: false })
  @IsDateString()
  @IsOptional()
  return_date?: string;

  @ApiProperty({ description: 'The ID of the medical record', required: false })
  @IsUUID()
  @IsOptional()
  medical_record_id?: string;
}
