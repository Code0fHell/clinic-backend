import { ApiProperty } from '@nestjs/swagger';

export class GeneratePaymentQRDto {
  @ApiProperty()
  bill_id: string;

  @ApiProperty({ type: 'number' })
  amount: number;
}