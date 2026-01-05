import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryWeeklyScheduleOwnerDto {
    @IsOptional()
    @IsIn(['all', 'PATIENT', 'DOCTOR', 'PHARMACIST', 'RECEPTIONIST'])
    roleType?: 'all' | 'PATIENT' | 'DOCTOR' | 'PHARMACIST' | 'RECEPTIONIST' = 'all';

    @ApiProperty({
        example: '2025-01-06',
        description: 'Ngày bắt đầu tuần (ISO 8601: YYYY-MM-DD)',
    })
    @IsDateString({}, { message: 'start_date phải là ngày hợp lệ (YYYY-MM-DD)' })
    start_date: string;

    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}

