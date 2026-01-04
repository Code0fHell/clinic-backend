import {
    Injectable,
    NotFoundException,
    Inject,
    forwardRef,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WorkScheduleDetail } from "../../shared/entities/work-schedule-detail.entity";
import { Repository, Between } from "typeorm";
import { Appointment } from "../../shared/entities/appointment.entity";
import { Staff } from "../../shared/entities/staff.entity";
import { Patient } from "../../shared/entities/patient.entity";
import { AppointmentStatus } from "../../shared/enums/appointment-status.enum";
import { BookAppointmentDto } from "./dto/book-appointment.dto";
import { Session } from "src/shared/enums/session.enum";
import { User } from "src/shared/entities/user.entity";
import { GuestBookAppointmentDto } from "./dto/guest-book-appointment.dto";
import { UserRole } from "src/shared/enums/user-role.enum";
import { NotificationService } from "../notification/notification.service";
import dayjs from "dayjs";
import { QueryAppointmentDTO } from "./dto/query-appointment.dto";
import { QueryAppointmentDashboardDTO } from "./dto/query-appointment-dashboard.dto";

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(WorkScheduleDetail)
        private readonly workScheduleDetailRepository: Repository<WorkScheduleDetail>,
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService
    ) { }

    async getUserWithStaff(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["staff"],
        });

        if (!user || !user.staff) {
            throw new NotFoundException(
                "This user is not a doctor or does not have staff profile"
            );
        }

        return user.staff.id;
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

    async getAvailableSlots(scheduleId: string) {
        return this.workScheduleDetailRepository.find({
            where: { schedule: { id: scheduleId }, is_booked: false },
            order: { slot_start: "ASC" },
        });
    }

    async bookAppointment(userId: string, dto: BookAppointmentDto) {
        const dateError = this.validateScheduledDate(dto.scheduled_date);
        if (dateError) {
            throw new BadRequestException(dateError);
        }

        // Find entities
        const doctor = await this.staffRepository.findOne({
            where: { id: dto.doctor_id },
        });
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["patient"],
        });

        if (!user) throw new Error("User not found");
        if (!user.patient) throw new Error("Patient not found for this user");

        const patient = user.patient;

        const slot = await this.workScheduleDetailRepository.findOne({
            where: { id: dto.schedule_detail_id },
            relations: ["schedule", "schedule.staff"],
        });

        if (!doctor || !patient) {
            throw new BadRequestException("Thông tin đặt lịch không hợp lệ");
        }

        if (!slot || !slot.schedule || !slot.schedule.staff) {
            throw new BadRequestException(
                "Khung giờ đã được chọn bởi người khác, vui lòng chọn khung giờ khác."
            );
        }

        const slotDate = dayjs(slot.schedule.work_date).format("YYYY-MM-DD");
        const selectedDate = dayjs(dto.scheduled_date).format("YYYY-MM-DD");

        if (slot.schedule.staff.id !== dto.doctor_id || slotDate !== selectedDate) {
            throw new BadRequestException(
                "Bác sĩ không làm việc trong ngày này, vui lòng chọn ngày khác."
            );
        }

        if (slot.is_booked) {
            throw new BadRequestException(
                "Khung giờ đã được chọn bởi người khác, vui lòng chọn khung giờ khác."
            );
        }

        // Mark slot as booked
        slot.is_booked = true;
        await this.workScheduleDetailRepository.save(slot);

        // Create appointment
        const appointment = this.appointmentRepository.create({
            doctor,
            patient,
            schedule_detail: slot,
            appointment_date: new Date(), // thời điểm đặt lịch
            scheduled_date: slot.slot_start, // ngày khám
            reason: dto.reason,
            session:
                slot.slot_start.getHours() < 12
                    ? Session.MORNING
                    : Session.AFTERNOON,
            status: AppointmentStatus.PENDING,
        });
        await this.appointmentRepository.save(appointment);

        // Create notification for patient
        try {
            await this.notificationService.createAppointmentNotification(
                userId,
                appointment.id,
                slot.slot_start,
                appointment.status
            );
        } catch (error) {
            console.error("Failed to create notification:", error);
            // Don't fail the appointment creation if notification fails
        }

        return { message: "Appointment booked", appointmentId: appointment.id };
    }

    async guestBookAppointment(dto: GuestBookAppointmentDto) {
        const dateError = this.validateScheduledDate(dto.scheduled_date);
        if (dateError) {
            throw new BadRequestException(dateError);
        }

        // Check doctor and slot
        const doctor = await this.staffRepository.findOne({
            where: { id: dto.doctor_id },
        });
        const slot = await this.workScheduleDetailRepository.findOne({
            where: { id: dto.schedule_detail_id },
            relations: ["schedule", "schedule.staff"],
        });
        if (!doctor || !slot || !slot.schedule) {
            throw new BadRequestException("Thông tin đặt lịch không hợp lệ");
        }

        const slotDate = dayjs(slot.schedule.work_date).format("YYYY-MM-DD");
        const selectedDate = dayjs(dto.scheduled_date).format("YYYY-MM-DD");

        if (slot.schedule.staff.id !== dto.doctor_id || slotDate !== selectedDate) {
            throw new BadRequestException(
                "Bác sĩ không làm việc trong ngày này, vui lòng chọn ngày khác."
            );
        }

        if (slot.is_booked) {
            throw new BadRequestException(
                "Khung giờ đã được chọn bởi người khác, vui lòng chọn khung giờ khác."
            );
        }

        // Create User (optional, or skip if you want only Patient)
        const user = this.userRepository.create({
            full_name: dto.full_name,
            email: dto.email,
            username: dto.email.split("@")[0],
            password: "guest",
            user_role: UserRole.PATIENT,
        });
        await this.userRepository.save(user);

        // Create Patient
        const patient = this.patientRepository.create({
            user,
            patient_full_name: dto.full_name,
            patient_dob: new Date(dto.dob),
            patient_phone: dto.phone,
        });
        await this.patientRepository.save(patient);

        // Mark slot as booked
        slot.is_booked = true;
        await this.workScheduleDetailRepository.save(slot);

        // Create appointment
        const appointment = this.appointmentRepository.create({
            doctor,
            patient,
            schedule_detail: slot,
            appointment_date: new Date(),
            scheduled_date: slot.slot_start,
            reason: dto.reason,
            session:
                slot.slot_start.getHours() < 12
                    ? Session.MORNING
                    : Session.AFTERNOON,
            status: AppointmentStatus.PENDING,
        });
        await this.appointmentRepository.save(appointment);

        // Create notification for guest patient (if user exists)
        if (patient.user) {
            try {
                await this.notificationService.createAppointmentNotification(
                    patient.user.id,
                    appointment.id,
                    slot.slot_start,
                    appointment.status
                );
            } catch (error) {
                console.error("Failed to create notification:", error);
                // Don't fail the appointment creation if notification fails
            }
        }

        return { message: "Appointment booked", appointmentId: appointment.id };
    }

    // Lấy ra tất cả cuộc hẹn
    async getAllAppointments() {
        return this.appointmentRepository.find({
            relations: ["doctor", "doctor.user", "patient", "schedule_detail"],
            order: { appointment_date: "ASC" },
        });
    }

    // Lấy ra cuộc hẹn trong ngày của bác sĩ hoặc lễ tân
    async getTodayAppointments(userId: string, dto: QueryAppointmentDTO) {
        const userInfo = await this.getUserWithRole(userId);
        const { role, staffId } = userInfo;

        const { date, keyword, visitFilter = 'all', page = 1, limit = 10 } = dto;

        const selectedDate = date ? dayjs(date) : dayjs();
        const startOfDay = selectedDate.startOf('day').toDate();
        const endOfDay = selectedDate.endOf('day').toDate();

        // DOCTOR 
        if (role === UserRole.DOCTOR) {
            if (!staffId) {
                throw new NotFoundException(
                    'This user is a doctor but does not have staff profile',
                );
            }

            return this.appointmentRepository.find({
                where: {
                    appointment_date: Between(startOfDay, endOfDay),
                    doctor: { id: staffId },
                },
                relations: [
                    'doctor',
                    'doctor.user',
                    'patient',
                    'patient.user',
                    'schedule_detail',
                ],
                order: { scheduled_date: 'ASC' },
            });
        }

        // RECEPTIONIST
        if (role === UserRole.RECEPTIONIST) {
            const qb = this.appointmentRepository
                .createQueryBuilder('a')
                // join
                .leftJoin('a.patient', 'p')
                .leftJoin('p.user', 'pu')
                .leftJoin('a.doctor', 'd')
                .leftJoin('d.user', 'du')
                .leftJoin('a.schedule_detail', 'sd')
                // Lấy dữ liệu cần thiết
                .select([
                    // appointment
                    'a.id',
                    'a.scheduled_date',
                    'a.reason',
                    'a.session',
                    'a.status',
                    // patient
                    'p.id',
                    'pu.full_name',
                    'pu.gender',
                    'pu.phone',
                    'pu.address',
                    // doctor
                    'd.id',
                    'du.full_name',
                    'd.is_available',
                    // visit status
                    'sd.id',
                ])
                .where('a.appointment_date BETWEEN :start AND :end', {
                    start: startOfDay,
                    end: endOfDay,
                });

            // Tìm kiếm theo tên / SĐT
            if (keyword) {
                qb.andWhere(
                    `(pu.full_name LIKE :keyword OR pu.phone LIKE :keyword)`,
                    { keyword: `%${keyword}%` },
                );
            }

            // Lọc theo trạng thái thăm khám
            if (visitFilter === 'added') {
                qb.andWhere('sd.id IS NOT NULL');
            }

            if (visitFilter === 'not_added') {
                qb.andWhere('sd.id IS NULL');
            }

            // Sắp xếp + phân trang
            qb.orderBy('a.scheduled_date', 'ASC')
                .skip((page - 1) * limit)
                .take(limit);

            const [rows, total] = await qb.getManyAndCount();

            // Mapping dữ liệu trả về cho FE
            return {
                data: rows.map((item) => ({
                    id: item.id,
                    patient: {
                        id: item.patient?.id,
                        name: item.patient?.user?.full_name,
                        gender: item.patient?.user?.gender,
                        phone: item.patient?.user?.phone,
                        address: item.patient?.user?.address
                    },
                    doctor: {
                        id: item.doctor?.id,
                        name: item.doctor?.user?.full_name,
                        is_available: item.doctor?.is_available
                    },
                    scheduled_date: item.scheduled_date,
                    reason: item.reason,
                    sesion: item.session,
                    status: item.status,
                    visitStatus: item.schedule_detail ? 'added' : 'not_added',
                })),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }

        throw new NotFoundException(
            'This endpoint is only available for doctors and receptionists',
        );
    }


    async updateAppointmentStatus(
        appointmentId: string,
        status: AppointmentStatus
    ) {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id: appointmentId },
            });

            if (!appointment) {
                throw new Error("Appointment not found");
            }
            appointment.status = status;
            await this.appointmentRepository.save(appointment);

            return {
                message: "Appointment status updated",
                status: appointment.status,
            };
        } catch (error: unknown) {
            let errMsg = "Unknown error";
            if (error instanceof Error) {
                errMsg = error.message;
            }
            return {
                message: "Failed to update appointment status",
                error: errMsg,
            };
        }
    }

    // Lấy lịch hẹn trong tuần
    async getAppointmentsThisWeek() {
        const startOfWeekDate = dayjs().startOf("week").add(1, "day").toDate(); // Thứ 2
        const endOfWeekDate = dayjs().endOf("week").subtract(1, "day").toDate(); // Thứ 6

        return this.appointmentRepository.find({
            where: {
                scheduled_date: Between(startOfWeekDate, endOfWeekDate),
            },
            relations: ["doctor", "doctor.user", "patient", "schedule_detail"],
            order: { scheduled_date: "ASC" },
        });
  }

  // Lấy danh sách lịch hẹn của bệnh nhân hiện tại
  async getAppointmentsForPatient(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["patient"],
    });

    if (!user || !user.patient) {
      throw new NotFoundException("Patient profile not found for this user");
    }

    return this.appointmentRepository.find({
      where: { patient: { id: user.patient.id } },
      relations: ["doctor", "doctor.user", "patient", "schedule_detail"],
      order: { scheduled_date: "ASC" },
    });
  }

  // Bệnh nhân hủy lịch hẹn của chính mình (trước 1 ngày so với giờ khám)
  async cancelAppointment(userId: string, appointmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ["patient", "patient.user", "schedule_detail"],
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    // Kiểm tra quyền sở hữu lịch hẹn
    if (appointment.patient?.user?.id !== userId) {
      throw new BadRequestException("Bạn không có quyền hủy lịch hẹn này");
    }

    // Chỉ cho phép hủy nếu còn ít nhất 1 ngày trước giờ khám
    const now = dayjs();
    const scheduled = dayjs(appointment.scheduled_date);
    const cutoff = scheduled.subtract(1, "day");

    if (now.isAfter(cutoff)) {
      throw new BadRequestException(
        "Bạn chỉ được phép hủy lịch hẹn trước ít nhất 1 ngày so với thời gian khám"
      );
    }

    // Cập nhật trạng thái cuộc hẹn
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);

    // Giải phóng lại slot nếu có
    if (appointment.schedule_detail) {
      appointment.schedule_detail.is_booked = false;
      await this.workScheduleDetailRepository.save(appointment.schedule_detail);
    }

    return {
      message: "Hủy lịch hẹn thành công",
      status: appointment.status,
    };
  }

    private validateScheduledDate(date: Date | string) {
        const selected = dayjs(date).startOf("day");
        const today = dayjs().startOf("day");
        const maxDate = today.add(30, "day");

        if (!selected.isValid()) {
            return "Ngày khám không hợp lệ, vui lòng chọn ngày khám trong tương lai không quá 30 ngày.";
        }

        if (selected.isBefore(today) || selected.isAfter(maxDate)) {
            return "Ngày khám không hợp lệ, vui lòng chọn ngày khám trong tương lai không quá 30 ngày.";
        }

        return "";
    }

    // Lấy ra số lượng lịch hẹn, đã hoàn thành, đang thực hiện và đã hủy
    async getCountAppointmentToday() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const query = this.appointmentRepository
            .createQueryBuilder('a')
            .where('a.scheduled_date BETWEEN :start AND :end', {
                start: startOfDay,
                end: endOfDay,
            });

        const [
            total,
            // pending,
            check_in,
            doing,
            completed,
            cancelled,
        ] = await Promise.all([
            query.getCount(),

            // query.clone()
            //     .andWhere('a.status = :status', {
            //         status: AppointmentStatus.PENDING,
            //     })
            //     .getCount(),

            query.clone()
                .andWhere('a.status = :status', {
                    status: AppointmentStatus.CHECKED_IN,
                })
                .getCount(),

            query.clone()
                .andWhere('a.status = :status', {
                    status: AppointmentStatus.DOING,
                })
                .getCount(),

            query.clone()
                .andWhere('a.status = :status', {
                    status: AppointmentStatus.COMPLETED,
                })
                .getCount(),

            query.clone()
                .andWhere('a.status = :status', {
                    status: AppointmentStatus.CANCELLED,
                })
                .getCount(),
        ]);

        return {
            total,
            // pending,
            check_in,
            doing,
            completed,
            cancelled,
        };
    }

    //Lấy lịch hẹn dành cho dashboard của reception
    async getAppointmentDashboard(dto: QueryAppointmentDashboardDTO) {
        const { keyword, appointmentFilter = 'all', cursor, limit = 10 } = dto;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const query = this.appointmentRepository
            .createQueryBuilder('a')
            // join
            .leftJoin('a.patient', 'p')
            .leftJoin('p.user', 'pu')
            .leftJoin('a.doctor', 'd')
            .leftJoin('d.user', 'du')
            .leftJoin('a.schedule_detail', 'sd')
            // Lấy dữ liệu cần thiết
            .select([
                // appointment
                'a.id',
                'a.scheduled_date',
                'a.reason',
                'a.session',
                'a.status',
                // patient
                'p.id',
                'pu.full_name',
                'pu.gender',
                'pu.phone',
                'pu.address',
                // doctor
                'd.id',
                'du.full_name',
                'd.is_available',
                // visit status
                'sd.id',
            ])
            .where('a.scheduled_date BETWEEN :start AND :end', {
                start: startOfDay,
                end: endOfDay,
            });

        // filter theo trang thái
        if (appointmentFilter !== 'all') {
            query.andWhere('a.status = :status', {
                status: appointmentFilter,
            });
        }

        // Tìm kiếm theo tên / SĐT
        if (keyword) {
            query.andWhere(
                '(pu.full_name LIKE :keyword OR pu.phone LIKE :keyword)',
                { keyword: `%${keyword}%` },
            );
        }

        if (cursor) {
            query.andWhere('a.scheduled_date > :cursor', {
                cursor: new Date(cursor),
            });
        }
        // Sắp xếp + phân trang
        query.orderBy('a.scheduled_date', 'ASC')
            .addOrderBy('a.id', 'ASC')
            .take(limit + 1); // +1 để check còn data không

        const rows = await query.getMany();

        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;

        const nextCursor =
            items.length > 0
                ? items[items.length - 1].scheduled_date
                : null;

        return {
            data: items.map((item) => ({
                id: item.id,
                patient: {
                    id: item.patient?.id,
                    name: item.patient?.user?.full_name,
                    gender: item.patient?.user?.gender,
                    phone: item.patient?.user?.phone,
                    address: item.patient?.user?.address,
                },
                doctor: {
                    id: item.doctor?.id,
                    name: item.doctor?.user?.full_name,
                    is_available: item.doctor?.is_available,
                },
                scheduled_date: item.scheduled_date,
                reason: item.reason,
                session: item.session,
                status: item.status,
                visitStatus: item.schedule_detail ? 'added' : 'not_added',
            })),
            meta: {
                limit,
                hasMore,
                nextCursor,
            },
        };
    }

    //Hủy lịch hẹn của bệnh nhân dành cho receptionist
    async cancelAppointmentDashboard(appointmentId: string) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointmentId },
        });

        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lịch hẹn');
        }

        if (appointment.status === AppointmentStatus.CANCELLED) {
            throw new BadRequestException('Lịch hẹn đã bị hủy trước đó');
        }

        if (appointment.status === AppointmentStatus.COMPLETED) {
            throw new BadRequestException('Không thể hủy lịch hẹn đã hoàn thành');
        }

        appointment.status = AppointmentStatus.CANCELLED;

        await this.appointmentRepository.save(appointment);

        return {
            message: 'Hủy lịch hẹn thành công',
            status: appointment.status,
        };
    }
}
