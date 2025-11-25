import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Roles } from 'src/common/guards/roles.decorator';

@ApiTags('medical-record')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Get('patient/:patientId')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  async getByPatient(@Param('patientId') patientId: string) {
    return this.medicalRecordService.getByPatientId(patientId);
  }

  @Get('patient/:patientId/history')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT, UserRole.RECEPTIONIST)
  async getHistory(@Param('patientId') patientId: string) {
    return this.medicalRecordService.getPatientHistory(patientId);
  }
}