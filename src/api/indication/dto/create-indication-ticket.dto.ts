import { ApiProperty } from '@nestjs/swagger';

export class CreateIndicationTicketDto {
  @ApiProperty({example: '', description: 'ID của phiếu khám bệnh'})
  medical_ticket_id: string;

  @ApiProperty( {example: '', description: 'ID của bệnh nhân'})
  patient_id: string;

  @ApiProperty({ type: [String], description: 'Danh sách ID của các dịch vụ y tế' })
  medical_service_ids: string[]; // Array of medical service IDs

  @ApiProperty({ required: false, description: 'Chẩn đoán lâm sàng' })
  diagnosis?: string;
}