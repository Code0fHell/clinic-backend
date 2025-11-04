import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, ArrayNotEmpty, ArrayUnique, IsArray, } from 'class-validator';

export class CreateIndicationTicketDto {
  @ApiProperty({
    example: '1b6a7e88-3b57-4d94-bba8-812c5f71f3a7',
    description: 'ID của phiếu khám bệnh (Medical Ticket)',
  })
  @IsNotEmpty({ message: 'medical_ticket_id là bắt buộc' })
  @IsUUID('4', { message: 'medical_ticket_id phải là UUID hợp lệ' })
  medical_ticket_id: string;

  @ApiProperty({
    example: 'ff360204-61f9-4df9-9e0a-bf84022799c1',
    description: 'ID của bệnh nhân',
  })
  @IsNotEmpty({ message: 'patient_id là bắt buộc' })
  @IsUUID('4', { message: 'patient_id phải là UUID hợp lệ' })
  patient_id: string;

  @ApiProperty({
    type: [String],
    description: 'Danh sách ID của các dịch vụ y tế',
    example: [
      '05a16ce3-9434-4107-9039-856ac3cd5cba',
      'f03ae281-6656-46de-931c-346ce15c5961',
    ],
  })
  @IsArray({ message: 'medical_service_ids phải là một mảng' })
  @ArrayNotEmpty({ message: 'Danh sách dịch vụ không được để trống' })
  @ArrayUnique({ message: 'Các dịch vụ không được trùng lặp' })
  @IsUUID('4', { each: true, message: 'Mỗi service_id phải là UUID hợp lệ' })
  medical_service_ids: string[];

  @ApiProperty({
    required: false,
    example: 'Viêm phổi nhẹ',
    description: 'Chẩn đoán lâm sàng',
  })
  @IsOptional()
  @IsString({ message: 'diagnosis phải là chuỗi' })
  diagnosis?: string;
}
