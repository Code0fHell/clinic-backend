import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdatePatientVitalsDto {
  @ApiPropertyOptional({ description: 'Chiều cao (cm)', example: 170 })
  @IsOptional()
  @IsNumber({}, { message: 'Chiều cao phải là số' })
  @Min(30)
  @Max(250)
  height?: number;

  @ApiPropertyOptional({ description: 'Cân nặng (kg)', example: 65 })
  @IsOptional()
  @IsNumber({}, { message: 'Cân nặng phải là số' })
  @Min(1)
  @Max(300)
  weight?: number;

  @ApiPropertyOptional({ description: 'Huyết áp', example: '120/80' })
  @IsOptional()
  @IsString()
  blood_pressure?: string;

  @ApiPropertyOptional({ description: 'Nhịp thở', example: '18 nhịp/phút' })
  @IsOptional()
  @IsString()
  respiratory_rate?: string;

  @ApiPropertyOptional({ description: 'Mạch đập (lần/phút)', example: 78 })
  @IsOptional()
  @IsNumber({}, { message: 'Mạch phải là số' })
  @Min(10)
  @Max(300)
  pulse_rate?: number;

  @ApiPropertyOptional({ description: 'Tiền sử bệnh' })
  @IsOptional()
  @IsString()
  medical_history?: string;
}

