import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../../shared/entities/patient.entity';
import { User } from '../../shared/entities/user.entity';
import { RolesGuard } from '../../common/guards/roles.guard';
import { WorkSchedule } from 'src/shared/entities/work-schedule.entity';
import { WorkScheduleDetail } from 'src/shared/entities/work-schedule-detail.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Bill } from '../../shared/entities/bill.entity';
import { Payment } from '../../shared/entities/payment.entity';
import { Visit } from '../../shared/entities/visit.entity';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Staff, Patient, User, WorkSchedule, WorkScheduleDetail, Bill, Payment, Visit])],
    providers: [OwnerService, RolesGuard],
    controllers: [OwnerController],
    exports: [OwnerService],
})
export class OwnerModule { }
