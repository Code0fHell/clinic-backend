import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../shared/enums/gender.enum';

export class CreatePatientDto {
    @ApiProperty()
    patient_full_name: string;

    @ApiProperty()
    patient_address: string;

    @ApiProperty()
    patient_phone: string;

    @ApiProperty()
    patient_dob: Date;

    @ApiProperty({ enum: Gender })
    patient_gender: Gender;

    @ApiProperty({ required: false })
    father_name?: string;

    @ApiProperty({ required: false })
    mother_name?: string;

    @ApiProperty({ required: false })
    father_phone?: string;

    @ApiProperty({ required: false })
    mother_phone?: string;

    @ApiProperty({ required: false })
    height?: number;

    @ApiProperty({ required: false })
    weight?: number;

    @ApiProperty({ required: false })
    blood_type?: string;

    @ApiProperty({ required: false })
    respiratory_rate?: string;

    @ApiProperty({ required: false })
    medical_history?: string;
}
