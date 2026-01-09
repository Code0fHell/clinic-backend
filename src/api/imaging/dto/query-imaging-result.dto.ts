import { IsOptional, IsIn, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class QueryImagingResultDto {
    @IsOptional()
    @IsIn(["all", "day", "week", "month"])
    filter_type?: "all" | "day" | "week" | "month";

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number;
}