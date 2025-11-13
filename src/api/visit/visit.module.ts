import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { Visit } from '../../shared/entities/visit.entity';
import { Patient } from '../../shared/entities/patient.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Appointment } from '../../shared/entities/appointment.entity';
import { MedicalRecord } from '../../shared/entities/medical-record.entity';
import { WorkScheduleDetail } from 'src/shared/entities/work-schedule-detail.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Visit, Patient, Staff, Appointment, MedicalRecord, WorkScheduleDetail]),
    ],
    providers: [VisitService],
    controllers: [VisitController],
    exports: [VisitService],
})
export class VisitModule { }
