import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsDateString,
    IsEnum,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
} from "class-validator";
import { Gender } from "src/shared/enums/gender.enum";

export class UpdatePatientDto {
    @ApiPropertyOptional({ description: "Chiều cao (cm)", example: 170 })
    @IsOptional()
    @IsNumber({}, { message: "Chiều cao phải là số" })
    @Min(30)
    @Max(250)
    height?: number;

    @ApiPropertyOptional({ description: "Cân nặng (kg)", example: 65 })
    @IsOptional()
    @IsNumber({}, { message: "Cân nặng phải là số" })
    @Min(1)
    @Max(300)
    weight?: number;

    @ApiPropertyOptional({
        example: "O+",
        required: false,
        description: "Nhóm máu của bệnh nhân (A, B, AB, O, ...)",
    })
    @IsOptional()
    @IsIn(
        ["A", "A+", "A-", "B", "B+", "B-", "AB", "AB+", "AB-", "O", "O+", "O-"],
        {
            message: "Nhóm máu không hợp lệ",
        }
    )
    blood_type?: string;

    @ApiPropertyOptional({
        example: "0912345678",
        description: "Số điện thoại liên hệ của bệnh nhân",
        required: false,
    })
    @Matches(/^(0|\+84)(\d{9,10})$/, {
        message: "Số điện thoại không hợp lệ",
    })
    @IsOptional()
    patient_phone: string;

    @IsOptional()
    @ApiPropertyOptional({
        enum: Gender,
        example: Gender.NAM,
        description: "Giới tính của bệnh nhân (MALE hoặc FEMALE)",
    })
    @IsNotEmpty({ message: "Giới tính không được để trống" })
    @IsEnum(Gender, { message: "Giới tính không hợp lệ" })
    patient_gender: Gender;

    @ApiPropertyOptional({
        example: "123 Đường ABC, Quận 1, TP. HCM",
        description: "Địa chỉ cư trú của bệnh nhân",
    })
    @IsNotEmpty({ message: "Địa chỉ không được để trống" })
    @IsString({ message: "Địa chỉ phải là chuỗi" })
    @MaxLength(255, { message: "Địa chỉ quá dài" })
    patient_address: string;

    @ApiPropertyOptional({
        example: "1995-06-15",
        description: "Ngày sinh bệnh nhân (định dạng ISO: YYYY-MM-DD)",
    })
    @IsNotEmpty({ message: "Ngày sinh không được để trống" })
    @IsDateString({}, { message: "Ngày sinh không hợp lệ" })
    patient_dob: Date;
}
