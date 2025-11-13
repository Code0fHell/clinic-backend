import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VisitType } from '../../../shared/enums/visit-type.enum';
import { VisitStatus } from '../../../shared/enums/visit-status.enum';

export class CreateVisitDto {
    @ApiProperty({ description: 'ID của bệnh nhân' })
    @IsUUID()
    patient_id: string;

    @ApiPropertyOptional({ description: 'ID bác sĩ (chỉ cần nếu không có appointment)' })
    @IsUUID()
    @IsOptional()
    doctor_id?: string;

    @ApiPropertyOptional({ description: 'ID của appointment nếu có' })
    @IsUUID()
    @IsOptional()
    appointment_id?: string;

    @ApiPropertyOptional({ description: 'ID của khung giờ bác sĩ (work schedule detail) nếu chọn slot rảnh' })
    @IsUUID()
    @IsOptional()
    work_schedule_detail_id?: string;

    @ApiProperty({ description: 'Loại visit', enum: VisitType })
    @IsEnum(VisitType)
    visit_type: VisitType;

    @ApiProperty({ description: 'Trạng thái visit', enum: VisitStatus })
    @IsEnum(VisitStatus)
    visit_status: VisitStatus;

    @ApiPropertyOptional({ description: 'Thời gian check-in (mặc định là hiện tại nếu không truyền)' })
    @IsDateString()
    @IsOptional()
    checked_in_at?: Date;

    @ApiPropertyOptional({ description: 'Thời gian hoàn thành visit' })
    @IsDateString()
    @IsOptional()
    completed_at?: Date;

    @ApiPropertyOptional({ description: 'ID của medical record nếu có' })
    @IsUUID()
    @IsOptional()
    medical_record_id?: string;
}
