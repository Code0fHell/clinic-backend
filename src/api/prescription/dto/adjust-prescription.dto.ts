import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MedicineItemDto } from './medicine-item.dto';

export class AdjustPrescriptionDto {
  @ApiProperty({
    description: 'Danh sách thuốc đã điều chỉnh (nếu có)',
    type: [MedicineItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineItemDto)
  @IsOptional()
  medicine_items?: MedicineItemDto[];
}

