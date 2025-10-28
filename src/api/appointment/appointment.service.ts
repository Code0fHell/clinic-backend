import { Injectable } from "@nestjs/common";
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
        private readonly userRepository: Repository<User>
    ) {}

    async getAvailableSlots(scheduleId: string) {
        return this.workScheduleDetailRepository.find({
            where: { schedule: { id: scheduleId }, is_booked: false },
            order: { slot_start: "ASC" },
        });
    }

    async bookAppointment(patientId: string, dto: BookAppointmentDto) {
        // Find entities
        const doctor = await this.staffRepository.findOne({
            where: { id: dto.doctor_id },
        });
        const patient = await this.patientRepository.findOne({
            where: { user: {} },
            relations: ["user"],
        });
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
            appointment_date: dto.appointment_date,
            reason: dto.reason,
            session:
                slot.slot_start.getHours() < 12
                    ? Session.MORNING
                    : Session.AFTERNOON,
            status: AppointmentStatus.PENDING,
        });
        await this.appointmentRepository.save(appointment);

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
            username: dto.email,
            user_role: UserRole.PATIENT,
        });
        await this.userRepository.save(user);

        // Create Patient
        const patient = this.patientRepository.create({
            user,
            patient_full_name: dto.full_name,
            patient_dob: new Date(dto.dob),
            patient_gender: dto.gender,
            patient_phone: dto.phone
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
            appointment_date: dto.appointment_date,
            reason: dto.reason,
            session:
                slot.slot_start.getHours() < 12
                    ? Session.MORNING
                    : Session.AFTERNOON,
            status: AppointmentStatus.PENDING,
        });
        await this.appointmentRepository.save(appointment);

        return { message: "Appointment booked", appointmentId: appointment.id };
    }

    // Lấy ra tất cả cuộc hẹn
    async getAllAppointments() {
    return this.appointmentRepository.find({
        relations: ["doctor", "patient", "schedule_detail"],
        order: { appointment_date: "ASC" },
    });
    }

    // Lấy ra cuộc hẹn trong ngày
    async getTodayAppointments() {
        const startOfDay = dayjs().startOf("day").toDate();
        const endOfDay = dayjs().endOf("day").toDate();

        return this.appointmentRepository.find({
            where: {
            appointment_date: Between(startOfDay, endOfDay),
            },
            relations: ["doctor", "patient", "schedule_detail"],
            order: { appointment_date: "ASC" },
        });
    }

    async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id: appointmentId}
            })

            if (!appointment) {
                throw new Error("Appointment not found");
            }
            appointment.status = status;
            await this.appointmentRepository.save(appointment);

            return {
                message: "Appointment status updated", status: appointment.status
            }
        } catch (error) {
            return {
                message: "Failed to update appointment status", error: error.message,
            }
        }
    }
}
