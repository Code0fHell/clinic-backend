import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
    @ApiPropertyOptional({ description: 'ID của bệnh nhân cần cập nhật' })
    id?: string;
}
