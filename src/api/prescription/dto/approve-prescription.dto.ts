import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApprovePrescriptionDto {
  @ApiProperty({
    description: 'Ghi chú khi duyệt đơn thuốc',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}


