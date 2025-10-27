import { IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionDetailDto {
  @ApiProperty({ description: 'The ID of the prescription' })
  @IsUUID()
  prescription_id: string;

  @ApiProperty({ description: 'The ID of the medicine' })
  @IsUUID()
  medicine_id: string;

  @ApiProperty({ description: 'The quantity of the medicine' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'The dosage instruction for the medicine', required: false })
  @IsString()
  @IsOptional()
  dosage?: string;
}
