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
import { PaymentStatus } from "src/shared/enums/payment-status.enum";
import { Payment } from "src/shared/entities/payment.entity";
import dayjs from 'dayjs';
import { QueryBillTodayDTO } from "./dto/query-bill-today.dto";


@Injectable()
export class BillService {
    constructor(
        @InjectRepository(Bill)
        private readonly billRepository: Repository<Bill>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
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

    // Hàm so sánh ngày
    private isSameDay(date: Date): boolean {
        const today = dayjs().format('YYYY-MM-DD');
        const target = dayjs(date).format('YYYY-MM-DD');
        return today === target;
    }

    // Lễ tân tạo hóa đơn cho bệnh nhân
    async createBill(dto: CreateBillDto) {
        const patient = await this.patientRepository.findOne({
            where: { id: dto.patient_id },
        });
        if (!patient) throw new NotFoundException("Patient not found");

        const today = dayjs().format('YYYY-MM-DD');
        const startOfDay = `${today} 00:00:00`;
        const endOfDay = `${today} 23:59:59`;

        let total = dto.total || 0;
        let doctor: Staff | null = null;
        let medicalTicket: MedicalTicket | null = null;
        let indicationTicket: IndicationTicket | null = null;
        let prescription: Prescription | null = null;

        // 1. BILL KHÁM BỆNH
        if (dto.bill_type === BillType.CLINICAL) {
            medicalTicket = await this.medicalTicketRepository.findOne({
                where: { id: dto.medical_ticket_id },
                relations: ["assigned_doctor_id"],
            });

            if (!medicalTicket)
                throw new NotFoundException("Chưa có phiếu khám lâm sàng");

            // KIỂM TRA NGÀY KHÁM
            if (!this.isSameDay(medicalTicket.issued_at)) {
                throw new BadRequestException(
                    "Chỉ được tạo hóa đơn trong ngày bệnh nhân đến khám"
                );
            }

            doctor = medicalTicket.assigned_doctor_id;
            total = Number(medicalTicket.clinical_fee || 0);

            if (!total) {
                throw new BadRequestException(
                    "Chưa có tiền khám lâm sàng"
                );
            }
        }
        // 2. BILL DỊCH VỤ
        else if (dto.bill_type === BillType.SERVICE) {
            indicationTicket = await this.indicationTicketRepository.findOne({
                where: { id: dto.indication_ticket_id },
                relations: ["doctor"],
            });

            if (!indicationTicket)
                throw new NotFoundException("Không có phiếu khám chỉ định");

            // CHECK NGÀY
            if (!this.isSameDay(indicationTicket.indication_date)) {
                throw new BadRequestException(
                    "Chỉ được tạo hóa đơn trong ngày thực hiện dịch vụ"
                );
            }

            doctor = indicationTicket.doctor;
            total = indicationTicket.total_fee || 0;
        }
        // 3. BILL THUỐC
        else if (dto.bill_type === BillType.MEDICINE) {
            prescription = await this.prescriptionRepository.findOne({
                where: { id: dto.prescription_id },
                relations: ["doctor", "details", "details.medicine"],
            });

            if (!prescription)
                throw new NotFoundException("Đơn thuốc không tồn tại");

            // CHECK NGÀY
            if (!this.isSameDay(prescription.created_at)) {
                throw new BadRequestException(
                    "Chỉ được tạo hóa đơn trong ngày kê đơn"
                );
            }

            doctor = prescription.doctor;

            total =
                prescription.total_fee ||
                prescription.details?.reduce((sum, d) => {
                    return sum + Number(d.medicine?.price || 0) * d.quantity;
                }, 0);

            if (!total) {
                throw new BadRequestException(
                    "Prescription does not contain any fee information"
                );
            }
        }
        else {
            throw new BadRequestException("Không thể tạo hóa đơn");
        }

        // Kiểm tra giao dịch đang pending/failed trong ngày
        const pendingOrFailedPaymentToday = await this.billRepository
            .createQueryBuilder('bill')
            .leftJoinAndSelect('bill.payments', 'payment')
            .leftJoinAndSelect('bill.patient', 'patient')
            .where('patient.id = :patientId', { patientId: dto.patient_id })
            .andWhere('payment.payment_status IN (:...statuses)', {
                statuses: [PaymentStatus.PENDING, PaymentStatus.FAILED],
            })
            .andWhere('payment.paid_at BETWEEN :start AND :end', {
                start: startOfDay,
                end: endOfDay,
            })
            .getOne();

        if (pendingOrFailedPaymentToday) {
            throw new BadRequestException(
                "Bệnh nhân đang có giao dịch chưa thanh toán trong hôm nay"
            );
        }

        const bill = this.billRepository.create({
            bill_type: dto.bill_type,
            patient,
            doctor,
            medical_ticket: medicalTicket,
            prescription,
            indication_ticket: indicationTicket,
            total,
            createdAt: new Date(),
        } as Partial<Bill>);

        return this.billRepository.save(bill);
    }


    // Lấy tất cả Bill theo ngày
    async getAllBillToday(user: any, dto: QueryBillTodayDTO) {
        const { billType = 'all', paymentMethod = 'all', paymentStatus = 'all', keyword, date, page = 1, limit = 10 } = dto;
        const selectedDate = date ? dayjs(date) : dayjs();
        const startOfDay = selectedDate.startOf('day').toDate();
        const endOfDay = selectedDate.endOf('day').toDate();

        const query = this.billRepository
            .createQueryBuilder('bill')
            .leftJoinAndSelect('bill.payments', 'payment')       // lấy payment nếu có
            .leftJoinAndSelect('bill.patient', 'patient')       // lấy patient
            .where('bill.created_at BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })

        // Tìm theo tên hoặc SĐT
        if (keyword) {
            query.andWhere(
                `(patient.patient_full_name LIKE :keyword 
                OR patient.patient_phone LIKE :keyword
                OR patient.fatherORmother_phone LIKE :keyword)`,
                { keyword: `%${keyword}%` }
            );
        }
        // Lọc theo loại hóa đơn
        if (billType !== 'all') {
            query.andWhere('bill.bill_type = :billType', { billType });
        }
        // Lọc theo hình thức thanh toán
        if (paymentMethod !== 'all') {
            query.andWhere(
                'payment.payment_method = :paymentMethod AND payment.payment_status = :successStatus',
                {
                    paymentMethod,
                    successStatus: PaymentStatus.SUCCESS,
                }
            );
        }
        // Lọc theo trạng thái thanh toán
        if (paymentStatus !== 'all') {
            query.andWhere('payment.payment_status = :paymentStatus', {
                paymentStatus,
            });
        }
        // Phân trang
        query
            .skip((page - 1) * limit)
            .take(limit);
        query.orderBy('bill.created_at', 'DESC');

        const [bills, total] = await query.getManyAndCount();

        return {
            data: bills.map(bill => {
                // Prefer a successful payment when choosing displayed payment method
                const successPayment = bill.payments?.find(p => p.payment_status === PaymentStatus.SUCCESS);
                const chosenPayment = successPayment || bill.payments?.[0] || null;

                return {
                    id: bill.id,
                    total: bill.total,
                    bill_type: bill.bill_type,
                    created_at: bill.created_at,
                    createdByName: user?.full_name,
                    patient_name: bill.patient?.patient_full_name || null,
                    patient_phone: bill.patient?.patient_phone || null,
                    payment_method: chosenPayment?.payment_method || null,
                    payment_status: bill.payments?.map(p => p.payment_status) || [],
                };
            }),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
        }
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
