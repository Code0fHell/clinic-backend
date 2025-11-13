import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalTicket } from '../../shared/entities/medical-ticket.entity';
import { Visit } from '../../shared/entities/visit.entity';
import { Staff } from '../../shared/entities/staff.entity';

@Injectable()
export class MedicalTicketService {
    constructor(
        @InjectRepository(MedicalTicket)
        private readonly ticketRepo: Repository<MedicalTicket>,

        @InjectRepository(Visit)
        private readonly visitRepo: Repository<Visit>,

        @InjectRepository(Staff)
        private readonly staffRepo: Repository<Staff>,
    ) { }

    async createMedicalTicket(visitId: string, user: any): Promise<any> {
        //Tìm visit (bao gồm bác sĩ & bệnh nhân)
        const visit = await this.visitRepo.findOne({
            where: { id: visitId },
            relations: ['doctor.user', 'patient'],
        });

        if (!visit) throw new NotFoundException('Không tìm thấy lượt khám (Visit)');
        if (!visit.doctor) throw new NotFoundException('Lượt khám chưa được gán bác sĩ');
        if (!visit.patient) throw new NotFoundException('Lượt khám chưa có thông tin bệnh nhân');

        const doctor = visit.doctor;
        const patient = visit.patient;
        const queueNumber = visit.queue_number;
        const patientId = patient.id;

        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // --- Chỉ cho phép tạo ticket cho lượt khám trong ngày hôm nay ---
        const todayCheck = new Date();
        const visitDate = new Date(visit.created_at);

        const isSameDay =
            todayCheck.getFullYear() === visitDate.getFullYear() &&
            todayCheck.getMonth() === visitDate.getMonth() &&
            todayCheck.getDate() === visitDate.getDate();

        if (!isSameDay) {
            throw new BadRequestException('Chỉ có thể tạo phiếu khám (Medical Ticket) cho lượt khám trong ngày hôm nay.');
        }

        // --- Kiểm tra xem đã có ticket hôm nay chưa ---
        const existingTicket = await this.ticketRepo.findOne({
            where: { visit_id: { id: visitId } },
            relations: ['visit_id', 'visit_id.patient', 'visit_id.doctor', 'visit_id.doctor.user'],
        });

        if (existingTicket) {
            return {
                ticket_id: existingTicket.id,
                visit_id: existingTicket.visit_id.id,
                queue_number: existingTicket.visit_id.queue_number,
                doctor_name: existingTicket.visit_id.doctor.user.full_name,
                patient_name: existingTicket.visit_id.patient.patient_full_name,
                patient_dob: existingTicket.visit_id.patient.patient_dob,
                patient_phone: existingTicket.visit_id.patient.patient_phone,
                patient_address: existingTicket.visit_id.patient.patient_address,
                createdByName: user?.full_name,
                barcode: existingTicket.barcode,
                issued_at: existingTicket.issued_at,
            };
        }

        let barcode = '';

        for (let i = 0; i < 5; i++) {
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            barcode = `MT-${today}-${String(queueNumber).padStart(3, '0')}-${patientId.substring(0, 5).toUpperCase()}-${randomPart}`;

            const exists = await this.ticketRepo.exists({ where: { barcode } });
            if (!exists) break;

            if (i === 4) {
                throw new InternalServerErrorException('Không thể tạo mã barcode duy nhất (trùng lặp quá nhiều lần)');
            }
        }

        const ticket = this.ticketRepo.create({
            visit_id: { id: visitId },
            assigned_doctor_id: { id: doctor.id },
            barcode,
        });

        await this.ticketRepo.save(ticket);

        visit.is_printed = true;
        await this.visitRepo.save(visit);

        const savedTicket = await this.ticketRepo.findOne({
            where: { id: ticket.id },
            relations: ['visit_id', 'visit_id.patient', 'visit_id.doctor', 'visit_id.doctor.user'],
        });

        if (!savedTicket) {
            throw new NotFoundException('Không tìm thấy Medical Ticket vừa tạo');
        }

        return {
            ticket_id: savedTicket.id,
            visit_id: savedTicket.visit_id.id,
            queue_number: savedTicket.visit_id.queue_number,
            doctor_name: savedTicket.visit_id.doctor.user.full_name,
            patient_name: savedTicket.visit_id.patient.patient_full_name,
            patient_dob: savedTicket.visit_id.patient.patient_dob,
            patient_phone: savedTicket.visit_id.patient.patient_phone,
            patient_address: savedTicket.visit_id.patient.patient_address,
            createdByName: user?.full_name,
            barcode: savedTicket.barcode,
            issued_at: savedTicket.issued_at,
        };
    }
}