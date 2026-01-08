import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../../shared/entities/medical-record.entity';
import { Patient } from '../../shared/entities/patient.entity';
import { Visit } from '../../shared/entities/visit.entity';
import { IndicationTicket } from '../../shared/entities/indication-ticket.entity';
import { Prescription } from '../../shared/entities/prescription.entity';
import { ImageResult } from '../../shared/entities/image-result.entity';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';
import { LabTestResult } from 'src/shared/entities/lab-test-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalRecord,
      Patient,
      Visit,
      IndicationTicket,
      Prescription,
      ImageResult,
      LabTestResult
    ]),
  ],
  providers: [MedicalRecordService],
  controllers: [MedicalRecordController],
  exports: [MedicalRecordService],
})
export class MedicalRecordModule {}