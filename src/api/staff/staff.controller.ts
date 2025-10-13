import { Controller, Get, Param, UseGuards, Post, Body, Delete } from '@nestjs/common';
import { StaffService } from './staff.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { AuthorizeDoctorDto } from './dto/authorize-doctor.dto';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Get all staff' })
  @Roles('ADMIN', 'OWNER')
  async getAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff by ID' })
  @Roles('ADMIN', 'OWNER')
  async getById(@Param('id') id: string) {
    return this.staffService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add new staff (admin/owner only)' })
  @Roles('ADMIN', 'OWNER')
  async addStaff(@Body() dto: CreateStaffDto) {
    return this.staffService.createStaff(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff (admin/owner only)' })
  @Roles('ADMIN', 'OWNER')
  async deleteStaff(@Param('id') id: string) {
    return this.staffService.deleteStaff(id);
  }

  @Post(':id/authorize-doctor')
  @ApiOperation({ summary: 'Owner sets doctor type for doctor' })
  @Roles('OWNER')
  async authorizeDoctor(@Param('id') id: string, @Body() dto: AuthorizeDoctorDto) {
    return this.staffService.authorizeDoctor(id, dto.doctor_type);
  }
}