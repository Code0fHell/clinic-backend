import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../../shared/entities/patient.entity';
import { User } from '../../shared/entities/user.entity';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { RolesGuard } from '../../common/guards/roles.guard';
import { WorkSchedule } from 'src/shared/entities/work-schedule.entity';
import { WorkScheduleDetail } from 'src/shared/entities/work-schedule-detail.entity';
import { Staff } from '../../shared/entities/staff.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Staff, Patient, User, WorkSchedule, WorkScheduleDetail])],
    providers: [PatientService, RolesGuard],
    controllers: [PatientController],
    exports: [PatientService],
})
export class PatientModule { }
