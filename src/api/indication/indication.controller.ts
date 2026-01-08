import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { IndicationService } from './indication.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CreateIndicationTicketDto } from './dto/create-indication-ticket.dto';
import { IndicationType } from 'src/shared/enums/indication-ticket-type.enum';

@ApiTags('indication-ticket')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/indication-ticket')
export class IndicationController {
  constructor(private readonly indicationService: IndicationService) {}

  @Post()
  @ApiOperation({ summary: 'CLINICAL Doctor creates an indication ticket' })
  @Roles('DOCTOR')
  async createIndicationTicket(@Req() req, @Body() dto: CreateIndicationTicketDto) {
    const userId = req.user.id;
    // Id là id của bác sĩ
    return this.indicationService.createIndicationTicket(userId, dto);
  }

  @Get('lab/today')
  @ApiOperation({ summary: 'LAB staff gets today lab test indications' })
  @Roles('DOCTOR')
  async getTodayLabIndications() {
    return this.indicationService.getTodayLabIndications();
  }

  @Get('doctor/today')
  @ApiOperation({ summary: 'Doctor gets their today indications with optional type filter' })
  @ApiQuery({ name: 'type', required: false, enum: IndicationType })
  @Roles('DOCTOR')
  async getDoctorTodayIndications(
    @Req() req,
    @Query('type') type?: IndicationType
  ) {
    const userId = req.user.id;
    return this.indicationService.getDoctorTodayIndications(userId, type);
  }
}