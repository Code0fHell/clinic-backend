import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkSchedule } from '../../shared/entities/work-schedule.entity';
import { WorkScheduleDetail } from '../../shared/entities/work-schedule-detail.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { WorkScheduleService } from './work-schedule.service';
import { WorkScheduleController } from './work-schedule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkSchedule, WorkScheduleDetail, Staff])],
  providers: [WorkScheduleService],
  controllers: [WorkScheduleController],
  exports: [WorkScheduleService],
})
export class WorkScheduleModule {}