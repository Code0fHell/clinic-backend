import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WorkScheduleService } from './work-schedule.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { AddWorkScheduleDto } from './dto/add-work-schedule.dto';
import { AddWorkScheduleDetailDto } from './dto/add-work-schedule-detail.dto';

@ApiTags('work-schedule')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/work-schedule')
export class WorkScheduleController {
  constructor(private readonly workScheduleService: WorkScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'OWNER adds work schedule for a doctor' })
  @Roles('OWNER')
  async addWorkSchedule(@Body() dto: AddWorkScheduleDto) {
    return this.workScheduleService.addWorkSchedule(dto);
  }

  @Post('detail')
  @ApiOperation({ summary: 'OWNER adds work schedule detail (slot) for a work schedule' })
  @Roles('OWNER')
  async addWorkScheduleDetail(@Body() dto: AddWorkScheduleDetailDto) {
    return this.workScheduleService.addWorkScheduleDetail(dto);
  }
}