import {
    Controller,
    Post,
    Patch,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
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
}
