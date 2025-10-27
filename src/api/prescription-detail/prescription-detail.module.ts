import { Module } from '@nestjs/common';
import { PrescriptionDetailController } from './prescription-detail.controller';
import { PrescriptionDetailService } from './prescription-detail.service';
import { PrescriptionDetail } from 'src/shared/entities/prescription-detail.entity';
import { Prescription } from 'src/shared/entities/prescription.entity';
import { Medicine } from 'src/shared/entities/medicine.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([PrescriptionDetail, Prescription, Medicine])],
  controllers: [PrescriptionDetailController],
  providers: [PrescriptionDetailService],
  exports: [PrescriptionDetailService],
})
export class PrescriptionDetailModule {}
