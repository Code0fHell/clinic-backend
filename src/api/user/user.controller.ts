import { Controller, Put, UseGuards, UseInterceptors, UploadedFile, Req, Get, Param, Body, BadRequestException, Post, Delete, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { extname, join } from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreatePatientAccountDto } from './dto/create-patient-account.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
// import { File } from 'multer';
import { existsSync, mkdirSync } from 'fs';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user) {
    return this.userService.getProfile(user.userId);
  }

  @Post('create-patient-account')
  @ApiOperation({ summary: 'Tạo tài khoản bệnh nhân mới (user + patient record) - Chỉ admin' })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async createPatientAccount(@Body() dto: CreatePatientAccountDto) {
    return this.userService.createPatientAccount(dto);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@CurrentUser() user, @Body() dto: UpdateProfileDto) {
    const userId = user.userId;
    return this.userService.updateProfile(userId, dto);
  }

  @Put('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload avatar image file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh đại diện (jpg, png, webp)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '../../../uploads/avatar');
          if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file được tải lên');
    }

    const userId = req.user.userId;
    const avatarUrl = `/static/avatar/${file.filename}`;

    await this.userService.updateProfile(userId, { avatar: avatarUrl });

    return {
      message: 'Cập nhật ảnh đại diện thành công!',
      avatar: avatarUrl,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: UserRole,
  ) {
    return this.userService.getAllUsers(page || 1, limit || 10, role);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @Roles('ADMIN', 'OWNER')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@CurrentUser() user, @Body() dto: ChangePasswordDto) {
    const userId = user.userId;
    return this.userService.changePassword(userId, dto);
  }
}
