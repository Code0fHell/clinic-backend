import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WorkScheduleDetail } from "../../shared/entities/work-schedule-detail.entity";
import { Repository } from "typeorm";
import { Appointment } from "../../shared/entities/appointment.entity";
import { Staff } from "../../shared/entities/staff.entity";
import { Patient } from "../../shared/entities/patient.entity";
import { AppointmentStatus } from "../../shared/enums/appointment-status.enum";
import { BookAppointmentDto } from "./dto/book-appointment.dto";
import { Session } from "src/shared/enums/session.enum";
import { User } from "src/shared/entities/user.entity";

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
            session: slot.slot_start.getHours() < 12 ? Session.MORNING : Session.AFTERNOON,
            status: AppointmentStatus.CHECKED_IN,
        });
        await this.appointmentRepository.save(appointment);

        return { message: "Appointment booked", appointmentId: appointment.id };
    }
}
