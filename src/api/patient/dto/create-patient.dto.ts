import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsEnum, IsNumber, IsIn, Matches, MaxLength, Min, Max, } from 'class-validator';
import { Gender } from '../../../shared/enums/gender.enum';

export class CreatePatientDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên đầy đủ của bệnh nhân',
  })
  @IsNotEmpty({ message: 'Họ và tên bệnh nhân không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự' })
  patient_full_name: string;

  @ApiProperty({
    example: '123 Đường ABC, Quận 1, TP. HCM',
    description: 'Địa chỉ cư trú của bệnh nhân',
  })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @MaxLength(255, { message: 'Địa chỉ quá dài' })
  patient_address: string;

  @ApiProperty({
    example: '0912345678',
    description: 'Số điện thoại liên hệ của bệnh nhân',
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^(0|\+84)(\d{9,10})$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  patient_phone: string;

  @ApiProperty({
    example: '1995-06-15',
    description: 'Ngày sinh bệnh nhân (định dạng ISO: YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  patient_dob: Date;

  @ApiProperty({
    enum: Gender,
    example: Gender.NAM,
    description: 'Giới tính của bệnh nhân (MALE hoặc FEMALE)',
  })
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  patient_gender: Gender;

  @ApiProperty({ example: 'Nguyễn Văn B', required: false })
  @IsOptional()
  @IsString({ message: 'Tên cha phải là chuỗi' })
  father_name?: string;

  @ApiProperty({ example: 'Trần Thị C', required: false })
  @IsOptional()
  @IsString({ message: 'Tên mẹ phải là chuỗi' })
  mother_name?: string;

  @ApiProperty({ example: '0987654321', required: false })
  @IsOptional()
  @Matches(/^(0|\+84)(\d{9,10})$/, { message: 'Số điện thoại của cha không hợp lệ' })
  father_phone?: string;

  @ApiProperty({ example: '0978123456', required: false })
  @IsOptional()
  @Matches(/^(0|\+84)(\d{9,10})$/, { message: 'Số điện thoại của mẹ không hợp lệ' })
  mother_phone?: string;

  @ApiProperty({ example: 170, required: false, description: 'Chiều cao (cm)' })
  @IsOptional()
  @IsNumber({}, { message: 'Chiều cao phải là số' })
  @Min(30, { message: 'Chiều cao không hợp lệ' })
  @Max(250, { message: 'Chiều cao không hợp lệ' })
  height?: number;

  @ApiProperty({ example: 65, required: false, description: 'Cân nặng (kg)' })
  @IsOptional()
  @IsNumber({}, { message: 'Cân nặng phải là số' })
  @Min(1, { message: 'Cân nặng không hợp lệ' })
  @Max(300, { message: 'Cân nặng không hợp lệ' })
  weight?: number;

  @ApiProperty({
    example: 'O+',
    required: false,
    description: 'Nhóm máu của bệnh nhân (A, B, AB, O, ...)',
  })
  @IsOptional()
  @IsIn(['A', 'A+', 'A-', 'B', 'B+', 'B-', 'AB', 'AB+', 'AB-', 'O', 'O+', 'O-'], {
    message: 'Nhóm máu không hợp lệ',
  })
  blood_type?: string;

  @ApiProperty({
    example: '16 nhịp/phút',
    required: false,
    description: 'Nhịp thở (Respiratory Rate)',
  })
  @IsOptional()
  @IsString({ message: 'Nhịp thở phải là chuỗi' })
  respiratory_rate?: string;

  @ApiProperty({
    example: '120/80',
    required: false,
    description: 'Huyết áp',
  })
  @IsOptional()
  @IsString({ message: 'Huyết áp phải là chuỗi' })
  blood_pressure?: string;

  @ApiProperty({
    example: 75,
    required: false,
    description: 'Mạch (lần/phút)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Mạch phải là số' })
  @Min(10, { message: 'Mạch không hợp lệ' })
  @Max(300, { message: 'Mạch không hợp lệ' })
  pulse_rate?: number;

  @ApiProperty({
    example: 'Bệnh nhân có tiền sử viêm phổi năm 2020',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tiền sử bệnh phải là chuỗi' })
  medical_history?: string;
}
