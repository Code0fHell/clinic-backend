import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicalTicketResponseDto {
  @ApiProperty({
    example: 15,
    description: 'Số thứ tự khám (queue number)',
  })
  @IsInt()
  readonly queue_number: number;

  @ApiProperty({
    example: 'Bác sĩ Nguyễn Văn A',
    description: 'Tên bác sĩ phụ trách khám bệnh',
  })
  @IsString()
  readonly doctor_name: string;

  @ApiProperty({
    example: 'MT-20251016-0015-7A91B',
    description: 'Mã barcode định danh duy nhất của phiếu khám',
  })
  @IsString()
  readonly barcode: string;

  @ApiProperty({
    example: '2025-10-16T17:15:22.000Z',
    description: 'Thời điểm tạo phiếu khám (issued_at)',
  })
  @IsDate()
  @Type(() => Date)
  readonly issued_at: Date;
}
