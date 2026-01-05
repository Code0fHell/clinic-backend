import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { ApprovePrescriptionDto } from './dto/approve-prescription.dto';
import { AdjustPrescriptionDto } from './dto/adjust-prescription.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Roles } from 'src/common/guards/roles.decorator';

@ApiTags('prescription')
@Controller('api/v1/prescription')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.OWNER)
  @ApiResponse({ status: 201, description: 'The prescription has been successfully created.' })
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prescriptions' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.OWNER)
  findAll() {
    return this.prescriptionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a prescription by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.OWNER)
  findOne(@Param('id') id: string) {
    return this.prescriptionService.findOne(id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get prescriptions by patient ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.OWNER)
  findByPatient(@Param('patientId') patientId: string) {
    return this.prescriptionService.findByPatient(patientId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a prescription by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.OWNER)
  update(@Param('id') id: string, @Body() updatePrescriptionDto: UpdatePrescriptionDto) {
    return this.prescriptionService.update(id, updatePrescriptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a prescription by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.prescriptionService.remove(id);
  }

  @Get('pending/list')
  @ApiOperation({ summary: 'Get pending prescriptions for pharmacist' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PHARMACIST, UserRole.OWNER)
  getPendingPrescriptions() {
    return this.prescriptionService.findPendingPrescriptions();
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve prescription by pharmacist' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PHARMACIST, UserRole.OWNER)
  async approve(@Param('id') id: string, @Body() dto: ApprovePrescriptionDto, @Req() req) {
    const userId = req.user.id;
    return this.prescriptionService.approvePrescription(id, userId);
  }

  @Get('pharmacist/recent-activity')
  @ApiOperation({ summary: 'Get recent approved prescriptions by pharmacist' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PHARMACIST, UserRole.OWNER)
  async getRecentActivity(@Req() req) {
    const userId = req.user.id;
    return this.prescriptionService.getRecentActivity(userId);
  }

  @Put(':id/adjust')
  @ApiOperation({ summary: 'Adjust prescription by pharmacist' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PHARMACIST, UserRole.OWNER)
  async adjust(@Param('id') id: string, @Body() dto: AdjustPrescriptionDto, @Req() req) {
    const userId = req.user.id;
    return this.prescriptionService.adjustPrescription(id, userId, dto);
  }
}
