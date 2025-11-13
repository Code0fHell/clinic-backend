import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '../../shared/entities/staff.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { User } from 'src/shared/entities/user.entity';
import { WorkSchedule } from 'src/shared/entities/work-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, User, WorkSchedule])],
  providers: [StaffService],
  controllers: [StaffController],
  exports: [StaffService],
})
export class StaffModule { }
