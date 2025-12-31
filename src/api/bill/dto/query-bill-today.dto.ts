import { IsOptional, IsInt, Min, IsString, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBillTodayDTO {
    @IsOptional()
    @IsIn(['all', 'clinical', 'service'])
    billType?: 'all' | 'clinical' | 'service' = 'all';

    @IsOptional()
    @IsIn(['all', 'cash', 'bank_transfer'])
    paymentMethod?: 'all' | 'cash' | 'bank_transfer' = 'all';

    @IsOptional()
    @IsIn(['all', 'pending', 'success', 'failed'])
    paymentStatus?: 'all' | 'pending' | 'success' | 'failed' = 'all';

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

