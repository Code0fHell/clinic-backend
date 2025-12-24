import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
    Get,
    Put,
    Query,
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
}
