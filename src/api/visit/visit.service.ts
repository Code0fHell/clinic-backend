import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Visit } from '../../shared/entities/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Patient } from '../../shared/entities/patient.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Appointment } from '../../shared/entities/appointment.entity';
import { MedicalRecord } from '../../shared/entities/medical-record.entity';
import { AppointmentStatus } from 'src/shared/enums/appointment-status.enum';
import { VisitStatus } from 'src/shared/enums/visit-status.enum';
import dayjs from 'dayjs';

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

        // Xử lý bệnh nhân có lịch hẹn trước
        if (dto.appointment_id) {
            appointment = await this.appointmentRepository.findOne({
                where: { id: dto.appointment_id },
                relations: ['doctor'],
            });
            if (!appointment) throw new NotFoundException(`Appointment với id ${dto.appointment_id} không tồn tại`);
            doctor = appointment.doctor;

            appointment.status = AppointmentStatus.CHECKED_IN;
            await this.appointmentRepository.save(appointment);
            dto.visit_status = VisitStatus.CHECKED_IN;
        } 
        // Bệnh nhân đến khám tự do
        else {
            if (!dto.doctor_id) {
                throw new BadRequestException('Bác sĩ phải được chọn khi không có Appointment');
            }
            doctor = await this.staffRepository.findOne({ where: { id: dto.doctor_id } });
            if (!doctor) throw new NotFoundException(`Doctor với id ${dto.doctor_id} không tồn tại`);
            dto.visit_status = VisitStatus.CHECKED_IN;
        }

        // Nếu có hồ sơ bệnh án
        let medicalRecord: MedicalRecord | null = null;
        if (dto.medical_record_id) {
        medicalRecord = await this.medicalRecordRepository.findOne({ where: { id: dto.medical_record_id } });
        if (!medicalRecord)
            throw new NotFoundException(`MedicalRecord với id ${dto.medical_record_id} không tồn tại`);
        }

        // Xác định queue_number tăng dần trong ngày
        const startOfDay = dayjs().startOf('day').toDate();
        const endOfDay = dayjs().endOf('day').toDate();

        const lastVisitToday = await this.visitRepository.findOne({
        where: { checked_in_at: Between(startOfDay, endOfDay) },
        order: { queue_number: 'DESC' },
        });

        const nextQueueNumber = lastVisitToday ? lastVisitToday.queue_number + 1 : 1;

        // Tạo visit
        const visit = this.visitRepository.create({
            patient,
            doctor,
            appointment,
            visit_type: dto.visit_type,
            visit_status: dto.visit_status,
            checked_in_at: dto.checked_in_at ?? new Date(),
            completed_at: dto.completed_at,
            medicalRecord,
            queue_number: nextQueueNumber,
        });

        return this.visitRepository.save(visit);
    }

    async getTodayQueue(): Promise<Visit[]> {
        const startOfDay = dayjs().startOf('day').toDate();
        const endOfDay = dayjs().endOf('day').toDate();

        return this.visitRepository
            .createQueryBuilder('visit')
            .leftJoinAndSelect('visit.patient', 'patient')
            .leftJoinAndSelect('visit.doctor', 'doctor')
            .leftJoinAndSelect('visit.appointment', 'appointment')
            .where('visit.checked_in_at BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
            .orderBy('CASE WHEN visit.appointment_id IS NOT NULL THEN 0 ELSE 1 END', 'ASC')
            .addOrderBy('visit.queue_number', 'ASC')
            .getMany();
    }
}
