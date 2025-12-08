import {
    Injectable,
    NotFoundException,
    Inject,
    forwardRef,
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
    ) {}

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
            where: { id: dto.schedule_detail_id, is_booked: false },
        });

        if (!doctor || !patient || !slot)
            throw new Error("Invalid booking data");

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
        // Check doctor and slot
        const doctor = await this.staffRepository.findOne({
            where: { id: dto.doctor_id },
        });
        const slot = await this.workScheduleDetailRepository.findOne({
            where: { id: dto.schedule_detail_id, is_booked: false },
        });
        if (!doctor || !slot) throw new Error("Invalid booking data");

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
    async getTodayAppointments(userId: string) {
        const userInfo = await this.getUserWithRole(userId);
        const { role, staffId } = userInfo;

        const startOfDay = dayjs().startOf("day").toDate();
        const endOfDay = dayjs().endOf("day").toDate();

        // Nếu là bác sĩ, lấy lịch hẹn của bác sĩ đó (lọc theo appointment_date và doctor_id)
        if (role === UserRole.DOCTOR) {
            if (!staffId) {
                throw new NotFoundException(
                    "This user is a doctor but does not have staff profile"
                );
            }

            return this.appointmentRepository.find({
                where: {
                    appointment_date: Between(startOfDay, endOfDay),
                    doctor: { id: staffId },
                },
                relations: [
                    "doctor",
                    "doctor.user",
                    "patient",
                    "schedule_detail",
                    "patient.user",
                ],
                order: { scheduled_date: "ASC" },
            });
        }

        // Nếu là lễ tân, lấy tất cả lịch hẹn được lên lịch trong ngày (lọc theo scheduled_date, không lọc theo doctor)
        if (role === UserRole.RECEPTIONIST) {
            return this.appointmentRepository.find({
                where: {
                    scheduled_date: Between(startOfDay, endOfDay),
                },
                relations: [
                    "doctor",
                    "doctor.user",
                    "patient",
                    "schedule_detail",
                    "patient.user",
                ],
                order: { scheduled_date: "ASC" },
            });
        }

        // Các role khác không được phép
        throw new NotFoundException(
            "This endpoint is only available for doctors and receptionists"
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
}
