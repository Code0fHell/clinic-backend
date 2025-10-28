import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsDateString } from 'class-validator';
import { Gender } from 'src/shared/enums/gender.enum';

export class GuestBookAppointmentDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    full_name: string;

    @IsDateString()
    @ApiProperty()
    dob: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({enum: Gender})
    gender: Gender;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    phone: string;

    @IsEmail()
    @ApiProperty()
    email: string;

    @IsString()
    @ApiProperty()
    reason: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    doctor_id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    schedule_detail_id: string;

    @IsDateString()
    @ApiProperty()
    appointment_date: string;
}