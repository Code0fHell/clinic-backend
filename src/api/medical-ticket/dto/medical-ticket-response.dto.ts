import { ApiProperty } from '@nestjs/swagger';

export class MedicalTicketResponseDto {
    @ApiProperty({ example: 15, description: 'Số thứ tự khám (queue number)' })
    queue_number: number;

    @ApiProperty({ example: 'Bác sĩ Nguyễn Văn A', description: 'Tên bác sĩ phụ trách' })
    doctor_name: string;

    @ApiProperty({ example: 'MT-20251016-0015-7A91B', description: 'Mã barcode của phiếu khám' })
    barcode: string;

    @ApiProperty({
        example: '2025-10-16T17:15:22.000Z',
        description: 'Thời điểm tạo phiếu (issued_at)',
    })
    issued_at: Date;
}
