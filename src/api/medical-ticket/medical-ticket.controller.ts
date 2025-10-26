import {
    Controller,
    Post,
    Param,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MedicalTicketService } from './medical-ticket.service';
import { MedicalTicketResponseDto } from './dto/medical-ticket-response.dto';

// 👇 Import thêm
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../shared/enums/user-role.enum';

@ApiTags('medical-ticket')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard) // dùng cả JWT + RolesGuard
@Controller('api/v1/medical-ticket')
export class MedicalTicketController {
    constructor(private readonly medicalTicketService: MedicalTicketService) { }

    @Post('create/:visitId')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo phiếu khám bệnh mới (chỉ lễ tân RECEPTIONIST)' })
    @ApiParam({ name: 'visitId', description: 'ID của lượt khám (Visit)' })
    @ApiResponse({
        status: 201,
        description: 'Tạo phiếu khám thành công',
        type: MedicalTicketResponseDto,
    })
    @Roles(UserRole.RECEPTIONIST)
    async create(@Param('visitId') visitId: string): Promise<MedicalTicketResponseDto> {
        return await this.medicalTicketService.createMedicalTicket(visitId);
    }
}
