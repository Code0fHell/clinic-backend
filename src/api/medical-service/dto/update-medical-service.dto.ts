import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '../../../shared/enums/service-type.enum';

export class UpdateMedicalServiceDto {
  @ApiPropertyOptional()
  service_name?: string;

  @ApiPropertyOptional({ enum: ServiceType })
  service_type?: ServiceType;

  @ApiPropertyOptional()
  service_price?: number;

  @ApiPropertyOptional()
  room_id?: string;
}