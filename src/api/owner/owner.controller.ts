import {
    Controller,
    Param,
    UseGuards,
    Get,
    Query,
    Res,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { OwnerService } from './owner.service';
import { DashboardRevenueQueryDto, Timeframe } from './dto/dashboard-revenue-query.dto';
import { QueryWeeklyScheduleOwnerDto } from './dto/query-owner-schedule.dto';
import type { Response } from 'express';

@ApiTags('owner')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/owner')
export class OwnerController {
    constructor(private readonly ownerService: OwnerService) { }

    @Get('revenue')
    @Roles(UserRole.OWNER)
    @ApiOperation({
        summary: 'Get dashboard revenue statistics (doanh thu)',
        description: 'Get revenue and visit statistics grouped by timeframe (day/week/month/quarter)',
    })
    @ApiQuery({ name: 'startDate', type: String, example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', type: String, example: '2024-01-31' })
    @ApiQuery({ name: 'timeframe', enum: Timeframe, example: Timeframe.DAY })
    @ApiResponse({
        status: 200,
        description: 'Revenue data grouped by timeframe',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    label: { type: 'string', example: '01/12' },
                    revenueClinic: { type: 'number', example: 68000000 },
                    revenuePharma: { type: 'number', example: 42000000 },
                    visits: { type: 'number', example: 46 },
                },
            },
        },
    })
    async getDashboardRevenue(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('timeframe') timeframe: Timeframe,
    ) {
        const data = await this.ownerService.getDashboardRevenue(startDate, endDate, timeframe);
        return {
            success: true,
            data,
        };
    }

    // API cho biểu đồ
    @Get('service-breakdown')
    @Roles(UserRole.OWNER)
    @ApiOperation({
        summary: 'Get service breakdown statistics',
        description: 'Get revenue and visit statistics grouped by service type (Khám bệnh, Cận lâm sàng, Bán thuốc)',
    })
    @ApiResponse({
        status: 200,
        description: 'Service breakdown data',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'Khám bệnh' },
                    revenue: { type: 'number', example: 1050000000 },
                    visits: { type: 'number', example: 1120 },
                },
            },
        },
    })
    async getServiceBreakdown() {
        const data = await this.ownerService.getServiceBreakdown();
        return {
            success: true,
            data,
        };
    }

    @Get('weekly')
    @ApiOperation({ summary: 'Get weekly schedule overview for all doctor, receptionist, pharamist' })
    @Roles('OWNER')
    @ApiQuery({ name: 'start_date', required: true, example: '2026-01-05' })
    @ApiQuery({ name: 'search', required: false, example: 'Nguyễn' })
    async getWeeklySchedule(@Query() dto: QueryWeeklyScheduleOwnerDto) {
        return this.ownerService.getWeeklySchedule(dto);
    }

    @Get('work-schedules/:id')
    @ApiOperation({ summary: 'Get daily schedule overview for doctor' })
    @Roles('OWNER')
    async getDoctorDailySchedule(@Param('id') id: string) {
        return this.ownerService.getDoctorDailySchedule(id);
    }

    @Get('export/revenue-detail')
    @Roles('OWNER')
    exportRevenueDetail(
        @Query('start') startDate: string,
        @Query('end') endDate: string,
        @Query('timeframe') timeframe: Timeframe,
        @Res() res: Response,
    ) {
        return this.ownerService.exportRevenueDetailToExcel(
            startDate,
            endDate,
            timeframe,
            res,
        );
    }

    @Get('medicine-sales')
    @Roles(UserRole.OWNER)
    @ApiOperation({
        summary: 'Get medicine sales statistics',
        description: 'Get number of medicines sold grouped by medicine name within a date range',
    })
    @ApiQuery({ name: 'startDate', type: String, example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', type: String, example: '2024-01-31' })
    @ApiResponse({
        status: 200,
        description: 'Medicine sales data',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string', example: 'Paracetamol' },
                    quantity: { type: 'number', example: 45 },
                },
            },
        },
    })
    async getMedicineSales(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const data = await this.ownerService.getMedicineSales(startDate, endDate);
        return {
            success: true,
            data,
        };
    }

}
