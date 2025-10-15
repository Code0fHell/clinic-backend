import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../../../shared/enums/service-type.enum';

export class CreateMedicalServiceDto {
  @ApiProperty()
  service_name: string;

  @ApiProperty({ enum: ServiceType })
  service_type: ServiceType;

  @ApiProperty()
  service_price: number;

  @ApiProperty()
  room_id: string;
}