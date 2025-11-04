import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class GeneratePaymentQRDto {
  @ApiProperty({
    description: 'ID của hóa đơn cần tạo mã QR thanh toán',
    example: 'c24b8f21-1a9e-4a6e-bd0e-90f9ff91a1f3',
  })
  @IsUUID('4', { message: 'bill_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'bill_id không được để trống' })
  bill_id: string;

  @ApiProperty({
    description: 'Số tiền cần thanh toán (VNĐ)',
    example: 250000,
    type: Number,
  })
  @IsNumber({}, { message: 'amount phải là số hợp lệ' })
  @Min(1, { message: 'amount phải lớn hơn 0' })
  amount: number;
}
