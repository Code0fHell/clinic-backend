import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MedicineItemDto {
  @ApiProperty({ example: 'dc22f52a-9083-4c05-91f2-71f45f17b4ef' })
  @IsUUID()
  medicine_id: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: '2 viên sáng, 1 viên tối',
    required: false,
  })
  @IsString()
  @IsOptional()
  dosage?: string;
}