import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicineDto {
  @ApiProperty({ description: 'The name of the medicine' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the medicine' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The price of the medicine' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'The manufacturer of the medicine' })
  @IsString()
  @IsOptional()
  manufacturer?: string;
}
