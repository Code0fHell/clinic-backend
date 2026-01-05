import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { Visit } from '../../shared/entities/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Patient } from '../../shared/entities/patient.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Appointment } from '../../shared/entities/appointment.entity';
import { MedicalRecord } from '../../shared/entities/medical-record.entity';
import { WorkScheduleDetail } from 'src/shared/entities/work-schedule-detail.entity';
import { AppointmentStatus } from 'src/shared/enums/appointment-status.enum';
import { VisitStatus } from 'src/shared/enums/visit-status.enum';
import { User } from '../../shared/entities/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import dayjs from 'dayjs';
import { QueryVisitDTO } from './dto/query-visit.dto';

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

        @InjectRepository(WorkScheduleDetail)
        private readonly workScheduleDetailRepository: Repository<WorkScheduleDetail>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(dto: CreateVisitDto): Promise<Visit> {
        // Kiểm tra patient
        const patient = await this.patientRepository.findOne({ where: { id: dto.patient_id } });
        if (!patient) throw new NotFoundException(`Bệnh nhân với ${dto.patient_id} không tồn tại`);

        let doctor: Staff | null = null;
        let appointment: Appointment | null = null;

        // Bệnh nhân có lịch hẹn trước
        if (dto.appointment_id) {
            appointment = await this.appointmentRepository.findOne({
                where: { id: dto.appointment_id },
                relations: ['doctor'],
            });
            if (!appointment) throw new NotFoundException(`Appointment với id ${dto.appointment_id} không tồn tại`);

            // CHECK NGÀY KHÁM THỰC TẾ
            const scheduledDate = dayjs(appointment.scheduled_date);

            // if (!scheduledDate.isSame(dayjs(), 'day')) {
            //     throw new BadRequestException(
            //         'Chỉ được tạo thăm khám đúng ngày đã đặt'
            //     );
            // }

            // Ưu tiên dùng doctor_id từ DTO (bác sĩ thay thế khi gốc nghỉ)
            if (dto.doctor_id) {
                doctor = await this.staffRepository.findOne({ where: { id: dto.doctor_id } });
                if (!doctor) throw new NotFoundException(`Doctor với id ${dto.doctor_id} không tồn tại`);

                // Nếu có chọn khung giờ → đánh dấu đã đặt (giống walk-in)
                if (dto.work_schedule_detail_id) {
                    const slot = await this.workScheduleDetailRepository.findOne({
                        where: { id: dto.work_schedule_detail_id, is_booked: false },
                        relations: ['schedule', 'schedule.staff'],
                    });
                    if (!slot) throw new BadRequestException('Khung giờ đã bị đặt hoặc không tồn tại');
                    if (slot.schedule.staff.id !== doctor.id) {
                        throw new BadRequestException('Khung giờ không thuộc bác sĩ đã chọn');
                    }
                    slot.is_booked = true;
                    await this.workScheduleDetailRepository.save(slot);
                }
            } else {
                // Bác sĩ gốc đi làm bình thường
                doctor = appointment.doctor;
            }

            appointment.status = AppointmentStatus.CHECKED_IN;
            await this.appointmentRepository.save(appointment);
            dto.visit_status = VisitStatus.CHECKED_IN;
        }
        // Bệnh nhân đến khám tự do
        else {
            if (!dto.doctor_id || !dto.work_schedule_detail_id) {
                throw new BadRequestException(
                    'Bác sĩ và khung giờ phải được chọn khi không có Appointment',
                );
            }

            doctor = await this.staffRepository.findOne({ where: { id: dto.doctor_id } });
            if (!doctor) throw new NotFoundException(`Doctor với id ${dto.doctor_id} không tồn tại`);
            dto.visit_status = VisitStatus.CHECKED_IN;

            // ===== XỬ LÝ ĐÁNH DẤU KHUNG GIỜ LÀ ĐÃ ĐẶT =====
            const slot = await this.workScheduleDetailRepository.findOne({
                where: { id: dto.work_schedule_detail_id, is_booked: false },
                relations: ['schedule', 'schedule.staff'],
            });

            if (!slot) {
                throw new BadRequestException('Khung giờ đã bị đặt hoặc không tồn tại');
            }

            // Đánh dấu slot đã đặt
            slot.is_booked = true;
            await this.workScheduleDetailRepository.save(slot);
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

    async getUserWithRole(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["staff"],
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            user,
            role: user.user_role,
            staffId: user.staff?.id,
        };
    }

    async getTodayQueue(userId: string, dto: QueryVisitDTO): Promise<{
        data: any[];
        pagination: {
            total: number;
            totalPages: number;
            page: number;
            limit: number;
        };
    }> {
        const { visitFilter = 'all', appointmentType = 'all', keyword, date, page = 1, limit = 10 } = dto;
        const selectedDate = date ? dayjs(date) : dayjs();
        const startOfDay = selectedDate.startOf('day').toDate();
        const endOfDay = selectedDate.endOf('day').toDate();

        // Lấy thông tin user và role
        const userInfo = await this.getUserWithRole(userId);
        const { role, staffId } = userInfo;

        const query = this.visitRepository
            .createQueryBuilder('visit')
            .leftJoinAndSelect('visit.patient', 'patient')
            .leftJoinAndSelect('visit.doctor', 'doctor')
            .leftJoinAndSelect('doctor.user', 'user')
            .leftJoinAndSelect('visit.appointment', 'appointment')
            .leftJoinAndSelect('visit.medicalTickets', 'medicalTickets')
            .where('visit.checked_in_at BETWEEN :start AND :end', {
                start: startOfDay,
                end: endOfDay,
            });

        // Filter theo doctor nếu user là DOCTOR
        if (role === UserRole.DOCTOR) {
            if (!staffId) {
                throw new NotFoundException(
                    'This user is a doctor but does not have staff profile',
                );
            }
            query.andWhere('visit.doctor_id = :doctorId', {
                doctorId: staffId,
            });
        }
        // RECEPTIONIST và các role khác xem được tất cả visit

        // Filter trạng thái
        if (visitFilter !== 'all') {
            query.andWhere('visit.visit_status = :status', {
                status: visitFilter,
            });
        }
        // Filter theo có / không có lịch hẹn
        if (appointmentType !== 'all') {
            if (appointmentType === 'true') {
                query.andWhere('visit.appointment_id IS NOT NULL');
            } else if (appointmentType === 'false') {
                query.andWhere('visit.appointment_id IS NULL');
            }
        }
        // Search
        if (keyword) {
            query.andWhere(
                `(patient.patient_full_name LIKE :keyword 
                OR patient.patient_phone LIKE :keyword
                OR patient.fatherORmother_phone LIKE :keyword)`,
                { keyword: `%${keyword}%` }
            );
        }
        // Ưu tiên có appointment
        query.addSelect(
            `CASE WHEN visit.appointment_id IS NOT NULL THEN 0 ELSE 1 END`,
            'has_appointment'
        );
        query
            .orderBy('has_appointment', 'ASC')
            .addOrderBy('visit.queue_number', 'ASC');
        query.skip((page - 1) * limit).take(limit);

        const [rows, total] = await query.getManyAndCount();

        // lọc bỏ field thừa
        const data = rows.map((item) => ({
            id: item.id,
            medicalTickets: item.medicalTickets,
            patient: {
                id: item.patient?.id,
                patient_full_name: item.patient?.patient_full_name,
                patient_gender: item.patient?.patient_gender,
                patient_phone: item.patient?.patient_phone,
                patient_address: item.patient?.patient_address,
                patient_dob: item.patient?.patient_dob,
            },
            doctor: item.doctor
                ? {
                    id: item.doctor.id,
                    name: item.doctor.user?.full_name,
                    user: item.doctor.user ? {
                        full_name: item.doctor.user.full_name,
                    } : null,
                }
                : null,
            appointment: item.appointment
                ? {
                    id: item.appointment.id,
                    scheduled_date: item.appointment.scheduled_date,
                    reason: item.appointment.reason,
                    status: item.appointment.status,
                }
                : null,
            visit_status: item.visit_status,
            visit_type: item.visit_type,
            reason: item.appointment?.reason,
            queue_number: item.queue_number,
            checked_in_at: item.checked_in_at,
            hasAppointment: !!item.appointment,
            isPrinted: item.is_printed
        }));

        return {
            data,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                page,
                limit,
            },
        };
    }

    // Cập nhật trạng thái visit
    async updateVisitStatus(visitId: string, newStatus: VisitStatus) {
        const visit = await this.visitRepository.findOne({
            where: { id: visitId },
            relations: ["patient", "doctor"],
        });

        if (!visit) {
            throw new NotFoundException(`Visit với id ${visitId} không tồn tại`);
        }

        // Cập nhật trạng thái visit
        visit.visit_status = newStatus;
        await this.visitRepository.save(visit);

        return {
            message: "Trạng thái thăm khám đã được cập nhật!", status: visit.visit_status
        }
    }

    // Tìm thông tin để tạo bill
    async findOneWithTicket(visitId: string, user: any): Promise<any> {
        const visit = await this.visitRepository.findOne({
            where: { id: visitId },
            relations: [
                'patient',
                'medicalTickets',
                'medicalTickets.indications',
                'medicalTickets.indications.doctor.user',
                'doctor',
                'doctor.user', // để lấy tên bác sĩ từ user
            ],
            select: {
                id: true,
                is_printed: true,
                patient: {
                    id: true,
                    patient_full_name: true,
                },
                doctor: {
                    id: true,
                    user: {
                        full_name: true,
                    },
                },
                medicalTickets: {
                    id: true,
                    clinical_fee: true,
                    issued_at: true,
                    indications: {
                        id: true,
                        total_fee: true,
                        indication_type: true,
                    },
                },
            },
        });

        if (!visit) {
            throw new NotFoundException('Không tìm thấy visit');
        }

        return {
            ...visit,
            created_by: user?.full_name
        };
    }

}
