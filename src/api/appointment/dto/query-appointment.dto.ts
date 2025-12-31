import { IsOptional, IsInt, Min, IsString, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAppointmentDTO {
    @IsOptional()
    @IsIn(['all', 'added', 'not_added'])
    visitFilter?: 'all' | 'added' | 'not_added' = 'all';

    @IsOptional()
    @IsString()
    keyword?: string; // tên hoặc số điện thoại

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}

