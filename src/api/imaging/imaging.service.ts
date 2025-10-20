import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageResult } from '../../shared/entities/image-result.entity';
import { IndicationTicket } from '../../shared/entities/indication-ticket.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Patient } from '../../shared/entities/patient.entity';
import { Repository } from 'typeorm';
import { CreateImageResultDto } from './dto/create-image-result.dto';
import { DoctorType } from 'src/shared/enums/doctor-type.enum';

@Injectable()
export class ImagingService {
  constructor(
    @InjectRepository(ImageResult)
    private readonly imageResultRepository: Repository<ImageResult>,
    @InjectRepository(IndicationTicket)
    private readonly indicationTicketRepository: Repository<IndicationTicket>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async createXrayResult(userId: string, dto: CreateImageResultDto, file: Express.Multer.File) {
    // Check doctor is DIAGNOSTIC
    const doctor = await this.staffRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
    if (!doctor || doctor.doctor_type !== DoctorType.DIAGNOSTIC) {
      throw new ForbiddenException('Only diagnostic doctors can upload X-ray results');
    }

    const indication = await this.indicationTicketRepository.findOne({
      where: { id: dto.indication_id },
      relations: ['patient', 'doctor'],
    });
    if (!indication) throw new NotFoundException('Indication ticket not found');

    const imageResult = this.imageResultRepository.create({
      indication,
      doctor,
      patient: indication.patient,
      barcode: `XRAY-${Date.now()}-${indication.id}`,
      result: dto.result,
      conclusion: dto.conclusion,
      // Save file path or URL
      image_url: `/uploads/xray/${file.filename}`,
    });
    await this.imageResultRepository.save(imageResult);

    // Optionally: Notify patient and clinical doctor (e.g., via event, notification, or status update)

    return {
      message: 'X-ray result uploaded',
      imageResultId: imageResult.id,
      image_url: imageResult.image_url,
      barcode: imageResult.barcode,
    };
  }

    async getResultsByPatient(patientId: string) {
        return this.imageResultRepository.find({
        where: { patient: { id: patientId } },
        relations: ['indication', 'doctor'],
        order: { created_at: 'DESC' },
        });
    }

    async getResultsByIndication(indicationId: string) {
        return this.imageResultRepository.find({
        where: { indication: { id: indicationId } },
        relations: ['patient', 'doctor'],
        order: { created_at: 'DESC' },
        });
    }
}