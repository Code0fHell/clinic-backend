import { Module } from '@nestjs/common';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { Prescription } from 'src/shared/entities/prescription.entity';
import { Patient } from 'src/shared/entities/patient.entity';
import { Staff } from 'src/shared/entities/staff.entity';
import { MedicalRecord } from 'src/shared/entities/medical-record.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription, Patient, Staff, MedicalRecord])],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
