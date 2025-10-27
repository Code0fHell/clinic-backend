import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from '../../shared/entities/visit.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@ApiTags('visit')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/visit')
export class VisitController {
    constructor(private readonly visitService: VisitService) { }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo mới visit cho bệnh nhân' })
    @ApiResponse({ 
        status: 201,
        description: 'Visit được tạo thành công',
        type: Visit
    })
    @Roles(UserRole.RECEPTIONIST)
    async create(@Body() dto: CreateVisitDto): Promise<Visit> {
        return this.visitService.create(dto);
    }
}
