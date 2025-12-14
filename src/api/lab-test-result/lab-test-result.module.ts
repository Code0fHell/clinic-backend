import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LabTestResultController } from './lab-test-result.controller';
import { LabTestResultService } from './lab-test-result.service';
import { LabTestResult } from 'src/shared/entities/lab-test-result.entity';
import { IndicationTicket } from 'src/shared/entities/indication-ticket.entity';
import { Staff } from 'src/shared/entities/staff.entity';
import { Patient } from 'src/shared/entities/patient.entity';
import { ServiceIndication } from 'src/shared/entities/service-indication.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LabTestResult,
      IndicationTicket,
      Staff,
      Patient,
      ServiceIndication,
    ]),
  ],
  providers: [LabTestResultService, RolesGuard],
  controllers: [LabTestResultController],
  exports: [LabTestResultService],
})
export class LabTestResultModule {}



