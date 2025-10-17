import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../../shared/entities/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Patient } from '../../shared/entities/patient.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Appointment } from '../../shared/entities/appointment.entity';
import { MedicalRecord } from '../../shared/entities/medical-record.entity';

@Injectable()
export class VisitService {
    constructor(
        @InjectRepository(Visit)
        private readonly visitRepository: Repository<Visit>,

        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,

        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,

        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,

        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>,
    ) { }

    async create(dto: CreateVisitDto): Promise<Visit> {
        // Kiểm tra patient
        const patient = await this.patientRepository.findOne({ where: { id: dto.patient_id } });
        if (!patient) throw new NotFoundException(`Bệnh nhân với ${dto.patient_id} không tồn tại`);

        let doctor: Staff | null = null;
        let appointment: Appointment | null = null;

        if (dto.appointment_id) {

            appointment = await this.appointmentRepository.findOne({
                where: { id: dto.appointment_id },
                relations: ['doctor'],
            });
            if (!appointment) throw new NotFoundException(`Appointment với id ${dto.appointment_id} không tồn tại`);
            doctor = appointment.doctor;
        } else {
            // Nếu không có appointment, bắt buộc truyền doctor_id
            if (!dto.doctor_id) {
                throw new BadRequestException('Bác sĩ phải được chọn khi không có Appointment');
            }
            doctor = await this.staffRepository.findOne({ where: { id: dto.doctor_id } });
            if (!doctor) throw new NotFoundException(`Doctor với id ${dto.doctor_id} không tồn tại`);
        }

        // Kiểm tra medical record nếu có
        let medicalRecord: MedicalRecord | null = null;
        if (dto.medical_record_id) {
            medicalRecord = await this.medicalRecordRepository.findOne({ where: { id: dto.medical_record_id } });
            if (!medicalRecord) throw new NotFoundException(`MedicalRecord với id${dto.medical_record_id} không tồn tại`);
        }

        // Tạo visit mới
        const visit = this.visitRepository.create({
            patient,
            doctor,
            appointment,
            visit_type: dto.visit_type,
            visit_status: dto.visit_status,
            checked_in_at: dto.checked_in_at ?? new Date(),
            completed_at: dto.completed_at,
            medicalRecord,
        });

        // Gán queue_number tăng dần, reset mỗi ngày
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Bắt đầu ngày

        const lastVisitToday = await this.visitRepository
            .createQueryBuilder('visit')
            .where('DATE(visit.checked_in_at) = :today', { today: today.toISOString().split('T')[0] })
            .orderBy('visit.queue_number', 'DESC')
            .getOne();

        visit.queue_number = lastVisitToday ? lastVisitToday.queue_number + 1 : 1;

        return this.visitRepository.save(visit);
    }
}
