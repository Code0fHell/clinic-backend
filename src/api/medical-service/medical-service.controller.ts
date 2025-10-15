import { Controller, Post, Put, Delete, Get, Param, Body, UseGuards } from '@nestjs/common';
import { MedicalServiceService } from './medical-service.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical-service.dto';

@ApiTags('medical-service')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/medical-service')
export class MedicalServiceController {
  constructor(private readonly medicalServiceService: MedicalServiceService) {}

  @Post()
  @ApiOperation({ summary: 'OWNER creates a medical service' })
  @Roles('OWNER')
  async create(@Body() dto: CreateMedicalServiceDto) {
    return this.medicalServiceService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'OWNER updates a medical service' })
  @Roles('OWNER')
  async update(@Param('id') id: string, @Body() dto: UpdateMedicalServiceDto) {
    return this.medicalServiceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'OWNER deletes a medical service' })
  @Roles('OWNER')
  async delete(@Param('id') id: string) {
    return this.medicalServiceService.delete(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all medical services' })
  async findAll() {
    return this.medicalServiceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical service by ID' })
  async findById(@Param('id') id: string) {
    return this.medicalServiceService.findById(id);
  }
}