import { Controller, Get, Param } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';

@Controller('api/v1/medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Get('patient/:patientId')
  async getByPatient(@Param('patientId') patientId: string) {
    return this.medicalRecordService.getByPatientId(patientId);
  }
}