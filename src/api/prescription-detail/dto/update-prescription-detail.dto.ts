import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionDetailDto } from './create-prescription-detail.dto';

export class UpdatePrescriptionDetailDto extends PartialType(CreatePrescriptionDetailDto) {}
