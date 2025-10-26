import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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

    async createMedicalTicket(visitId: string): Promise<any> {
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

        return {
            queue_number: visit.queue_number,
            doctor_name: doctor.user.full_name,
            barcode: ticket.barcode,
            issued_at: ticket.issued_at,
        };
    }
}
