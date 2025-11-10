import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from '../../shared/entities/visit.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { VisitStatus } from 'src/shared/enums/visit-status.enum';

@ApiTags('visit')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/visit')
export class VisitController {
    constructor(private readonly visitService: VisitService) { }


    @Get('queue')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy ra danh sách thăm khám thực tế trong ngày (ưu tiên bệnh nhân đã đặt lịch)' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách visit trong ngày',
        type: [Visit]
    })
    async getTodayQueue() {
        return this.visitService.getTodayQueue();
    }

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

    // Cập nhật trạng thái visit (Ví dụ: từ "CHECKED_IN" sang "DOING")
    @Put(':id/status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cập nhật trạng thái visit' })
    @ApiResponse({
        status: 200,
        description: 'Trạng thái visit đã được cập nhật',
        type: Visit
    })
    async updateVisitStatus(
        @Param('id') visitId: string,
        @Body() body: { visit_status: VisitStatus },
    ) {
        const { visit_status } = body;
        return this.visitService.updateVisitStatus(visitId, visit_status);
    }
}
