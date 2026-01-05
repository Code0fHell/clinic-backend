import { Controller, Post, Body, UseGuards, Get, Query, Put, Delete, Param } from '@nestjs/common';
import { WorkScheduleService } from './work-schedule.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { AddWorkScheduleDto } from './dto/add-work-schedule.dto';
import { AddWorkScheduleDetailDto } from './dto/add-work-schedule-detail.dto';
import { GetWeeklyScheduleDto } from './dto/get-weekly-schedule.dto';
import { GetStaffWeeklyScheduleDto } from './dto/get-staff-weekly-schedule.dto';
import { CreateWeeklyScheduleDto } from './dto/create-weekly-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';

@ApiTags('work-schedule')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/work-schedule')
export class WorkScheduleController {
  constructor(private readonly workScheduleService: WorkScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'ADMIN/OWNER adds work schedule for a doctor' })
  @Roles('OWNER', 'ADMIN')
  async addWorkSchedule(@Body() dto: AddWorkScheduleDto) {
    return this.workScheduleService.addWorkSchedule(dto);
  }

  @Post('detail')
  @ApiOperation({ summary: 'ADMIN/OWNER adds work schedule detail (slot) for a work schedule' })
  @Roles('OWNER', 'ADMIN')
  async addWorkScheduleDetail(@Body() dto: AddWorkScheduleDetailDto) {
    return this.workScheduleService.addWorkScheduleDetail(dto);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly schedule overview for all staff' })
  @Roles('OWNER', 'ADMIN')
  @ApiQuery({ name: 'start_date', required: true, example: '2025-01-06' })
  @ApiQuery({ name: 'end_date', required: true, example: '2025-01-12' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'doctor_type', required: false })
  async getWeeklySchedule(@Query() dto: GetWeeklyScheduleDto) {
    return this.workScheduleService.getWeeklySchedule(dto);
  }

  @Get('staff-weekly')
  @ApiOperation({ summary: 'Get weekly schedule detail for a specific staff' })
  @Roles('OWNER', 'ADMIN')
  @ApiQuery({ name: 'staff_id', required: true })
  @ApiQuery({ name: 'start_date', required: true, example: '2025-01-06' })
  @ApiQuery({ name: 'end_date', required: true, example: '2025-01-12' })
  async getStaffWeeklySchedule(@Query() dto: GetStaffWeeklyScheduleDto) {
    return this.workScheduleService.getStaffWeeklySchedule(dto);
  }

  @Post('create-weekly')
  @ApiOperation({ summary: 'Create weekly schedule with auto-generated slots' })
  @Roles('OWNER', 'ADMIN')
  async createWeeklySchedule(@Body() dto: CreateWeeklyScheduleDto) {
    return this.workScheduleService.createWeeklySchedule(dto);
  }

  @Post('copy-previous-week')
  @ApiOperation({ summary: 'Copy schedule from previous week' })
  @Roles('OWNER', 'ADMIN')
  @ApiQuery({ name: 'staff_id', required: true })
  @ApiQuery({ name: 'target_week_start', required: true, example: '2025-01-06' })
  async copyFromPreviousWeek(
    @Query('staff_id') staffId: string,
    @Query('target_week_start') targetWeekStart: string,
  ) {
    return this.workScheduleService.copyFromPreviousWeek(staffId, targetWeekStart);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update work schedule' })
  @Roles('OWNER', 'ADMIN')
  async updateWorkSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateWorkScheduleDto,
  ) {
    return this.workScheduleService.updateWorkSchedule(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete work schedule' })
  @Roles('OWNER', 'ADMIN')
  async deleteWorkSchedule(@Param('id') id: string) {
    return this.workScheduleService.deleteWorkSchedule(id);
  }
}