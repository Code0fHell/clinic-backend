import { Controller, Post, Put, Delete, Get, Param, Body, UseGuards, Query } from '@nestjs/common';
import { MedicalServiceService } from './medical-service.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical-service.dto';
import { MedicalService } from '../../shared/entities/medical-service.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('medical-service')
@ApiBearerAuth()
@Controller('api/v1/medical-service')
export class MedicalServiceController {
  constructor(private readonly medicalServiceService: MedicalServiceService) {}

  @Post()
  @ApiOperation({ summary: 'OWNER creates a medical service' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  async create(@Body() dto: CreateMedicalServiceDto) {
    return this.medicalServiceService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'OWNER updates a medical service' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  async update(@Param('id') id: string, @Body() dto: UpdateMedicalServiceDto) {
    return this.medicalServiceService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'OWNER deletes a medical service' })
  @Roles('OWNER')
  async delete(@Param('id') id: string) {
    return this.medicalServiceService.delete(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all medical services with pagination and filtering' })
  @ApiResponse({ status: 200, type: [MedicalService] })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('service_type') service_type?: string,
  ) {
    const data = await this.medicalServiceService.findAll(page, limit, service_type);
    return { success: true, data };
  }

  @Get('homepage')
  @ApiOperation({ summary: 'Get services for homepage (max 3)' })
  @ApiResponse({ status: 200, type: [MedicalService] })
  async getHomepageServices(@Query('service_type') service_type?: string) {
    const data = await this.medicalServiceService.findHomepageServices(service_type);
    return { success: true, data };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search medical services by name and type' })
  @ApiResponse({ status: 200, type: [MedicalService] })
  async search(
    @Query('q') q: string,
    @Query('service_type') service_type?: string,
  ) {
    const data = await this.medicalServiceService.searchByName(q, service_type);
    return {
      success: true,
      message: data.length ? 'Search results found' : 'No results found',
      count: data.length,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical service by ID' })
  @ApiResponse({ status: 200, type: MedicalService })
  async findById(@Param('id') id: string) {
    const service = await this.medicalServiceService.findById(id);
    return { success: true, data: service };
  }
}
