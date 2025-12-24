import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bill } from "../../shared/entities/bill.entity";
import { Patient } from "../../shared/entities/patient.entity";
import { Staff } from "../../shared/entities/staff.entity";
import { MedicalTicket } from "../../shared/entities/medical-ticket.entity";
import { IndicationTicket } from "../../shared/entities/indication-ticket.entity";
import { Prescription } from "../../shared/entities/prescription.entity";
import { BillType } from "../../shared/enums/bill-type.enum";
import { Repository } from "typeorm";
import { CreateBillDto } from "./dto/create-bill.dto";
import { Between } from 'typeorm';


@Injectable()
export class BillService {
    constructor(
        @InjectRepository(Bill)
        private readonly billRepository: Repository<Bill>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,
        @InjectRepository(MedicalTicket)
        private readonly medicalTicketRepository: Repository<MedicalTicket>,
        @InjectRepository(IndicationTicket)
        private readonly indicationTicketRepository: Repository<IndicationTicket>,
        @InjectRepository(Prescription)
        private readonly prescriptionRepository: Repository<Prescription>
    ) { }

    // Lễ tân tạo hóa đơn cho bệnh nhân
    async createBill(dto: CreateBillDto) {
        const patient = await this.patientRepository.findOne({
            where: { id: dto.patient_id },
        });
        if (!patient) throw new NotFoundException("Patient not found");

        let total = dto.total || 0;
        let doctor: Staff | null = null;
        let medicalTicket: MedicalTicket | null = null;
        let indicationTicket: IndicationTicket | null = null;
        let prescription: Prescription | null = null;

        // Hóa đơn phí khám bệnh
        if (dto.bill_type === BillType.CLINICAL) {
            medicalTicket = await this.medicalTicketRepository.findOne({
                where: { id: dto.medical_ticket_id },
                relations: ["assigned_doctor_id"],
            });
            if (!medicalTicket)
                throw new NotFoundException("Medical ticket not found");

            doctor = medicalTicket.assigned_doctor_id;
            total = Number(medicalTicket.clinical_fee || 0);
            if (!total) {
                throw new BadRequestException(
                    "Medical ticket is missing clinical fee. Vui lòng cập nhật phí khám."
                );
            }
        }
        else if (dto.bill_type === BillType.SERVICE) {
            // Hóa đơn dịch vụ cận lâm sàng
            indicationTicket = await this.indicationTicketRepository.findOne({
                where: { id: dto.indication_ticket_id },
                relations: ["doctor"],
            });
            if (!indicationTicket)
                throw new NotFoundException("Indication ticket not found");
            doctor = indicationTicket.doctor;
            total = indicationTicket.total_fee || 0;
        } else if (dto.bill_type === BillType.MEDICINE) {
            // Hóa đơn thuốc
            prescription = await this.prescriptionRepository.findOne({
                where: { id: dto.prescription_id },
                relations: ["doctor", "details", "details.medicine"],
            });
            if (!prescription)
                throw new NotFoundException("Prescription not found");
            doctor = prescription.doctor;
            total = Number(prescription.total_fee || 0);
            if (!total && prescription.details?.length) {
                total = prescription.details.reduce((sum, detail) => {
                    const price = Number(detail.medicine?.price || 0);
                    return sum + price * detail.quantity;
                }, 0);
            }

            if (!total) {
                throw new BadRequestException("Prescription does not contain any fee information");
            }
        } else {
            throw new BadRequestException("Invalid bill type");
        }

        const bill = this.billRepository.create({
            bill_type: dto.bill_type,
            patient: patient,
            doctor: doctor,
            medical_ticket: medicalTicket,
            prescription: prescription,
            indication_ticket: indicationTicket,
            total,
            createdAt: new Date(),
        } as Partial<Bill>);

        return this.billRepository.save(bill);
    }

    // Lấy tất cả Bill theo ngày
    async getAllBillToday(user: any) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const bills = await this.billRepository
            .createQueryBuilder('bill')
            .leftJoinAndSelect('bill.payments', 'payment')       // lấy payment nếu có
            .leftJoinAndSelect('bill.patient', 'patient')       // lấy patient
            .where('bill.created_at BETWEEN :start AND :end', { start, end })
            .orderBy('bill.created_at', 'DESC')
            .getMany();

        return bills.map(bill => ({
            id: bill.id,
            total: bill.total,
            bill_type: bill.bill_type,
            created_at: bill.created_at,
            createdByName: user?.full_name,
            patient_name: bill.patient ? bill.patient.patient_full_name : null, // thêm tên bệnh nhân
            patient_phone: bill.patient ? bill.patient.patient_phone : null,
            payment_method: bill.payments[0]?.payment_method || null,
            payment_status: bill.payments.length > 0
                ? bill.payments.map(p => p.payment_status)
                : null,
        }));
    }

    // Lấy ra chi tiết thông tin bill
    async getDetailBill(billId: string) {
        const bill = await this.billRepository.findOne({
            where: { id: billId }
        });

        return {
            id: billId,
            total: bill?.total
        }
    }
}
