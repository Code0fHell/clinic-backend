import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/guards/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { LoadPatientInterceptor } from 'src/common/interceptors/load-patient.interceptor';

@ApiTags('medical-record')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(LoadPatientInterceptor)
@Controller('api/v1/medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Get('me')
  @Roles(UserRole.PATIENT)
  async getMine(@CurrentUser('patient') patient) {
    return this.medicalRecordService.getByPatientId(patient.id);
  }

  @Get('history')
  @Roles(UserRole.PATIENT)
  async getMyHistory(@CurrentUser('patient') patient) {
    console.log("patient, ", patient);
    return this.medicalRecordService.getPatientHistory(patient.id);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.DOCTOR, UserRole.RECEPTIONIST)
  async getByPatientForStaff(@Param('patientId') patientId: string) {
    return this.medicalRecordService.getByPatientId(patientId);
  }

  @Get('patient/:patientId/history')
  @Roles(UserRole.DOCTOR, UserRole.RECEPTIONIST)
  async getHistoryForStaff(@Param('patientId') patientId: string) {
    return this.medicalRecordService.getPatientHistory(patientId);
  }
}
