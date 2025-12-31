import { IsOptional, IsInt, Min, IsString, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVisitDTO {
    @IsOptional()
    @IsIn(['all', 'checked_in', 'completed', 'cancelled'])
    visitFilter?: 'all' | 'checked_in' | 'completed' | 'cancelled' = 'all';

    @IsOptional()
    @IsIn(['all', 'true', 'false'])
    appointmentType?: 'all' | 'true' | 'false' = 'all';

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

