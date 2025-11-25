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
}
