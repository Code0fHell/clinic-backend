import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalRecord } from '../../shared/entities/medical-record.entity';
import { Repository } from 'typeorm';
import { Patient } from '../../shared/entities/patient.entity';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async getByPatientId(patientId: string) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const record = await this.medicalRecordRepository.findOne({
      where: { patient: { id: patientId } },
      relations: [
        'patient',
        'doctor',
        'doctor.user',
        'visits',
        'prescriptions',
      ],
      order: { created_at: 'DESC' },
    });
    if (!record) throw new NotFoundException('Medical record not found');
    return record;
  }
}