import {
  Controller,
  Get,
  Put,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @Roles('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'OWNER')
  async getUserNotifications(@Req() req) {
    const userId = req.user.sub;
    return this.notificationService.getUserNotifications(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @Roles('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'OWNER')
  async getUnreadCount(@Req() req) {
    const userId = req.user.sub;
    const count = await this.notificationService.getUnreadCount(userId);
    return { unread_count: count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @Roles('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'OWNER')
  async markAsRead(@Param('id') notificationId: string, @Req() req) {
    const userId = req.user.sub;
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @Roles('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'OWNER')
  async markAllAsRead(@Req() req) {
    const userId = req.user.sub;
    return this.notificationService.markAllAsRead(userId);
  }
}

