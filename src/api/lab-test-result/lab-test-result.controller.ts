import { Controller, Post, Body, Req, UseGuards, Get, Param } from '@nestjs/common';
import { LabTestResultService } from './lab-test-result.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CreateLabTestResultDto } from './dto/create-lab-test-result.dto';

@ApiTags('lab-test-result')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/lab-test-result')
export class LabTestResultController {
  constructor(private readonly labTestResultService: LabTestResultService) {}

  @Post()
  @ApiOperation({ summary: 'LAB staff creates a lab test result' })
  @Roles('DOCTOR')
  async createLabTestResult(@Req() req, @Body() dto: CreateLabTestResultDto) {
    const userId = req.user.id;
    return this.labTestResultService.createLabTestResult(userId, dto);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get lab test results by patient ID' })
  @Roles('DOCTOR', 'PATIENT')
  async getResultsByPatient(@Param('patientId') patientId: string) {
    return this.labTestResultService.getResultsByPatient(patientId);
  }

  @Get('indication/:indicationId')
  @ApiOperation({ summary: 'Get lab test results by indication ID' })
  @Roles('DOCTOR')
  async getResultsByIndication(@Param('indicationId') indicationId: string) {
    return this.labTestResultService.getResultsByIndication(indicationId);
  }

  @Get('today/completed')
  @ApiOperation({ summary: 'Get today completed lab test results' })
  @Roles('DOCTOR')
  async getTodayCompletedResults() {
    return this.labTestResultService.getTodayCompletedResults();
  }
}

