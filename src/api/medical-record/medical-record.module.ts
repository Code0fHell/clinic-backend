import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../../shared/entities/medical-record.entity';
import { Patient } from '../../shared/entities/patient.entity';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Patient])],
  providers: [MedicalRecordService],
  controllers: [MedicalRecordController],
  exports: [MedicalRecordService],
})
export class MedicalRecordModule {}