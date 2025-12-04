import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { IndicationService } from './indication.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CreateIndicationTicketDto } from './dto/create-indication-ticket.dto';

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
    const userId = req.user.sub;
    // Id là id của bác sĩ
    return this.indicationService.createIndicationTicket(userId, dto);
  }
}