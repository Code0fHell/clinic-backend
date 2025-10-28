import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PrescriptionDetailService } from './prescription-detail.service';
import { CreatePrescriptionDetailDto } from './dto/create-prescription-detail.dto';
import { UpdatePrescriptionDetailDto } from './dto/update-prescription-detail.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Roles } from 'src/common/guards/roles.decorator';

@ApiTags('prescription-detail')
@Controller('prescription-detail')
export class PrescriptionDetailController {
  constructor(private readonly prescriptionDetailService: PrescriptionDetailService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prescription detail' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.OWNER)
  @ApiResponse({ status: 201, description: 'The prescription detail has been successfully created.' })
  create(@Body() createPrescriptionDetailDto: CreatePrescriptionDetailDto) {
    return this.prescriptionDetailService.create(createPrescriptionDetailDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prescription details' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.OWNER)
  findAll() {
    return this.prescriptionDetailService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a prescription detail by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.OWNER)
  findOne(@Param('id') id: string) {
    return this.prescriptionDetailService.findOne(id);
  }

  @Get('prescription/:prescriptionId')
  @ApiOperation({ summary: 'Get prescription details by prescription ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.OWNER)
  findByPrescription(@Param('prescriptionId') prescriptionId: string) {
    return this.prescriptionDetailService.findByPrescription(prescriptionId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a prescription detail by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.OWNER)
  update(@Param('id') id: string, @Body() updatePrescriptionDetailDto: UpdatePrescriptionDetailDto) {
    return this.prescriptionDetailService.update(id, updatePrescriptionDetailDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a prescription detail by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.prescriptionDetailService.remove(id);
  }
}
