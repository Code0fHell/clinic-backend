import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Roles } from 'src/common/guards/roles.decorator';

@ApiTags('prescription')
@Controller('prescription')
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
}
