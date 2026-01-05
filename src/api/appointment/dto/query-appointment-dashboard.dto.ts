import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAppointmentDashboardDTO {
    @IsOptional()
    @IsIn(['all', 'PENDING', 'CANCELLED', 'CHECKED_IN', 'DOING', 'COMPLETED'])
    appointmentFilter?: 'all' | 'PENDING' | 'CANCELLED' | 'CHECKED_IN' | 'DOING' | 'COMPLETED' = 'all';

    @IsOptional()
    @IsString()
    keyword?: string;

    // cursor = scheduled_date của item cuối cùng
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}
