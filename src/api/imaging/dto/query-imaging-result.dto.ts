export class QueryImagingResultDto {
    filter_type?: "all" | "day" | "week" | "month";
    page?: number;
    limit?: number;
}
