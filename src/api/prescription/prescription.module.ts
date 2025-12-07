import { Module, forwardRef } from '@nestjs/common';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { Prescription } from 'src/shared/entities/prescription.entity';
import { Patient } from 'src/shared/entities/patient.entity';
import { Staff } from 'src/shared/entities/staff.entity';
import { MedicalRecord } from 'src/shared/entities/medical-record.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Medicine } from 'src/shared/entities/medicine.entity';
import { PrescriptionDetail } from 'src/shared/entities/prescription-detail.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prescription, Patient, Staff, MedicalRecord, Medicine, PrescriptionDetail]),
    forwardRef(() => NotificationModule),
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
