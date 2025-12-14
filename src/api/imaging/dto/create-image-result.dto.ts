import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, IsOptional } from "class-validator";

export class CreateImageResultDto {
    @ApiProperty({
        description: "ID của phiếu chỉ định (indication ticket)",
        example: "e45b12a3-6d4a-4e91-9a9b-7b6e4a8f9c2a",
    })
    @IsUUID("4", { message: "indication_id phải là UUID hợp lệ" })
    indication_id: string;

    @ApiProperty({
        required: false,
        description: "Kết quả phân tích ảnh X-ray (mô tả chi tiết)",
        example: "Phổi phải có dấu hiệu mờ nhẹ, nghi viêm phổi khu trú.",
    })
    @IsString({ message: "result phải là chuỗi ký tự" })
    @IsOptional()
    result?: string;

    @ApiProperty({
        required: false,
        description: "Mô tả chi tiết (alias của result)",
        example: "Phổi phải có dấu hiệu mờ nhẹ, nghi viêm phổi khu trú.",
    })
    @IsString({ message: "description phải là chuỗi ký tự" })
    @IsOptional()
    description?: string;

    @ApiProperty({
        required: false,
        description: "Kết luận tổng quát từ bác sĩ chẩn đoán",
        example: "Viêm phổi nhẹ, theo dõi tiến triển sau 7 ngày.",
    })
    @IsString({ message: "conclusion phải là chuỗi ký tự" })
    @IsOptional()
    conclusion?: string;
}
