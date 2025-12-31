import {
  Controller, Get, Param, UseGuards, Post, Body, Delete, HttpCode,
  HttpStatus, Query, Put
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { AuthorizeDoctorDto } from './dto/authorize-doctor.dto';
import { DoctorType } from 'src/shared/enums/doctor-type.enum';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('staff')
@ApiBearerAuth()
@Controller('api/v1/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  // Lấy danh sách bác sĩ lâm sàng
  @Get('clinical-doctors')
  @ApiOperation({ summary: 'Get all clinical doctors' })
  async getClinicalDoctors() {
    return this.staffService.findDoctorsByType(DoctorType.CLINICAL);
  }

  // Lấy danh sách bác sĩ cho trang chủ (tối đa 3)
  @Get('homepage-doctors')
  @ApiOperation({ summary: 'Get doctors for homepage (max 3)' })
  async getHomepageDoctors() {
    const data = await this.staffService.findHomepageDoctors();
    return { success: true, data };
  }

  // Lấy lịch làm việc của bác sĩ
  @Get(':id/work-schedules')
  @ApiOperation({ summary: 'Get work schedules of a doctor' })
  async getWorkSchedules(@Param('id') doctorId: string) {
    return this.staffService.getWorkSchedules(doctorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all staff' })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAll() {
    return this.staffService.findAll();
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get all staff with pagination and filters (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllPaginated(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: UserRole,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ) {
    return this.staffService.findAllWithPagination(
      page || 1,
      limit || 10,
      role,
      department,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff by ID' })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getById(@Param('id') id: string) {
    return this.staffService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add new staff (admin/owner only)' })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addStaff(@Body() dto: CreateStaffDto) {
    return this.staffService.createStaff(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff information (admin/owner only)' })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStaff(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.updateStaff(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff (admin/owner only)' })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteStaff(@Param('id') id: string) {
    return this.staffService.deleteStaff(id);
  }

  @Post(':id/authorize-doctor')
  @ApiOperation({ summary: 'Owner sets doctor type for doctor' })
  @Roles('OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async authorizeDoctor(@Param('id') id: string, @Body() dto: AuthorizeDoctorDto) {
    return this.staffService.authorizeDoctor(id, dto.doctor_type);
  }
}