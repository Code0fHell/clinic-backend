import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentController } from './appointment.controller';
import { Appointment } from 'src/shared/entities/appointment.entity';
import { AppointmentService } from './appointment.service';
import { WorkScheduleDetail } from 'src/shared/entities/work-schedule-detail.entity';
import { Staff } from 'src/shared/entities/staff.entity';
import { Patient } from 'src/shared/entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, WorkScheduleDetail, Staff, Patient])],
  providers: [AppointmentService],
  controllers: [AppointmentController],
  exports: [AppointmentService],
})
export class AppointmentModule {}