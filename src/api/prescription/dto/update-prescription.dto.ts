import { PartialType,  } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsNumber, Min } from 'class-validator'; 

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
    @IsNumber({}, { message: 'total_fee phải là số' })
    @Min(0, { message: 'total_fee phải lớn hơn hoặc bằng 0' })
    total_fee: number;
}
