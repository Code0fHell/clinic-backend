import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
    Get,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { LinkPatientAccountDto } from './dto/link-patient-account.dto';
import { Patient } from '../../shared/entities/patient.entity';
import { WorkScheduleDetail } from 'src/shared/entities/work-schedule-detail.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UpdatePatientVitalsDto } from './dto/update-patient-vitals.dto';

@ApiTags('patient')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/patient')
export class PatientController {
    constructor(private readonly patientService: PatientService) { }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo hồ sơ bệnh nhân (chưa có tài khoản) rành cho lễ tân' })
    @ApiResponse({
        status: 201,
        description: 'Tạo hồ sơ bệnh nhân thành công',
        type: Patient,
    })
    @Roles(UserRole.RECEPTIONIST)
    async create(@Body() dto: CreatePatientDto): Promise<Patient> {
        return await this.patientService.createPatientWithoutAccount(dto);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cập nhật thông tin bệnh nhân' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật bệnh nhân thành công',
        type: Patient,
    })
    @Roles(UserRole.RECEPTIONIST)
    async updatePatient(
        @Param('id') id: string,
        @Body() dto: UpdatePatientDto
    ) {
        return await this.patientService.updatePatient(id, dto);
    }

    @Get('all-patient')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy tất cả thông tin bệnh nhân' })
    @ApiResponse({
        status: 200,
        description: 'Lấy thông tin bệnh nhân thành công',
        type: Patient,
    })
    @Roles(UserRole.RECEPTIONIST)
    async getAllPaient() {
        return await this.patientService.getAllPatient();
    }

    @Patch('link-account')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Ánh xạ tài khoản người dùng với hồ sơ bệnh nhân' })
    @ApiResponse({
        status: 200,
        description: 'Ánh xạ tài khoản thành công',
        type: Patient,
    })
    @Roles(UserRole.PATIENT)
    async linkAccount(@Body() dto: LinkPatientAccountDto): Promise<Patient> {
        return await this.patientService.linkAccountToExistingPatient(dto);
    }

    @Get('doctor-available-today')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy khung giờ trống của tất cả bác sĩ trong ngày (chỉ giờ chưa qua)' })
    @ApiResponse({
        status: 200,
        description: 'Trả về danh sách bác sĩ và khung giờ trống còn hiệu lực trong ngày',
    })
    @Roles(UserRole.RECEPTIONIST)
    async getAvailableWorkSchedulesToday(): Promise<{ doctor: Staff; freeSlots: WorkScheduleDetail[] }[]> {
        try {
            const availableSchedules = await this.patientService.getAvailableWorkSchedulesToday();
            return availableSchedules;
        } catch (error) {
            console.error('Lỗi khi lấy lịch làm việc trống hôm nay:', error);
            throw error;
        }
    }

    @Patch(':id/vitals')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bác sĩ cập nhật sinh hiệu & tiền sử bệnh cho bệnh nhân' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật thành công',
        type: Patient,
    })
    @Roles(UserRole.DOCTOR)
    async updateVitals(
        @Param('id') patientId: string,
        @Body() dto: UpdatePatientVitalsDto,
    ) {
        return this.patientService.updatePatientVitals(patientId, dto);
    }
}
