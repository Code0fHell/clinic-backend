import { Controller, Post, Body, UseGuards, UploadedFile, UseInterceptors, Req, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImagingService } from './imaging.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CreateImageResultDto } from './dto/create-image-result.dto';
import { extname } from 'path';

@ApiTags('imaging')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/imaging')
export class ImagingController {
  constructor(private readonly imagingService: ImagingService) {}

  @Post('xray-result')
  @ApiOperation({ summary: 'DIAGNOSTIC doctor uploads X-ray image and result' })
  @ApiConsumes('multipart/form-data')
  @Roles('DOCTOR')
  @UseInterceptors(FileInterceptor('image_file', {
    storage: diskStorage({
      destination: './uploads/xray',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        cb(new Error('Only image files are allowed!'), false);
      } else {
        cb(null, true);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async createXrayResult(
    @Req() req,
    @Body() dto: CreateImageResultDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const doctorId = req.user.userId;
    return this.imagingService.createXrayResult(doctorId, dto, file);
  }

  @Get('patient/:patientId/results')
  @ApiOperation({ summary: 'PATIENT views their X-ray results' })
  @Roles('PATIENT')
  async getPatientResults(@Param('patientId') patientId: string) {
    return this.imagingService.getResultsByPatient(patientId);
  }

  @Get('indication/:indicationId/results')
  @ApiOperation({ summary: 'CLINICAL doctor views X-ray results for an indication' })
  @Roles('DOCTOR')
  async getResultsByIndication(@Param('indicationId') indicationId: string) {
    return this.imagingService.getResultsByIndication(indicationId);
  }
}