import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "../../shared/entities/payment.entity";
import { Bill } from "../../shared/entities/bill.entity";
import { User } from "../../shared/entities/user.entity";
import { Repository } from "typeorm";
import { GeneratePaymentQRDto } from "./dto/generate-payment-qr.dto";
import { PaymentStatus } from "../../shared/enums/payment-status.enum";
import { PaymentMethod } from "../../shared/enums/payment-method.enum";
import * as QRCode from "qrcode";
import { Patient } from "../../shared/entities/patient.entity";
import crypto from "crypto";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Bill)
        private readonly billRepository: Repository<Bill>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>
    ) {}

    async createVietQRPayment(dto: GeneratePaymentQRDto) {
        const bill = await this.billRepository.findOne({
            where: { id: dto.bill_id },
            relations: ["patient", "patient.user"],
        });
        if (!bill) throw new NotFoundException("Bill not found");

        const patient = bill.patient;
        if (!patient) throw new NotFoundException("Patient not found");

        // Nếu bệnh nhân có tài khoản thì dùng user, nếu không thì lưu trực tiếp patient
        const payment = this.paymentRepository.create({
            bill,
            amount: dto.amount,
            payment_method: PaymentMethod.BANK_TRANSFER,
            payment_status: PaymentStatus.PENDING,
            paidByUser: patient.user || null,
            paidByPatient: patient.user ? null : patient,
        });
        await this.paymentRepository.save(payment);

        // VietQR config
        const bankNumber = process.env.VIETQR_BANK_NUMBER!;
        const bankCode = process.env.VIETQR_BANK_CODE!;
        console.log("Bank Code:", bankCode);
        const accountName = process.env.VIETQR_ACCOUNT_NAME!;
        const template = process.env.VIETQR_TEMPLATE || "compact";
        const amount = dto.amount;
        const addInfo = `Thanh toan hoa don ${bill.id}`;

        const vietqrUrl = `https://img.vietqr.io/image/${bankCode}-${bankNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;

        const qrCodeBase64 = await QRCode.toDataURL(vietqrUrl);

        return {
            paymentId: payment.id,
            vietqrUrl,
            qrCode: qrCodeBase64,
            amount,
            bill_id: bill.id,
            bankNumber,
            bankCode,
            accountName,
            addInfo,
        };
    }

    async handleVietQRWebhook(body: any) {
      if (!body) {
        return { success: false, message: 'Empty body' };
      }

      // Log dữ liệu để debug
      console.log("Webhook payload:", body);

      const orderCode = body.orderCode || body.order_code || body.order_id || body.paymentId;
      const amount = body.amount || body.total_amount;
      const status = body.status || body.transaction_status;
      const description = body.description || body.addInfo;
      const transactionDateTime = body.transactionDateTime || body.dateTime;
      const checksum = body.checksum || body.signature;

      if (!orderCode || !amount) {
        return { success: false, message: 'Missing required fields' };
      }

      const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '';
      const rawString = `${orderCode}${amount}${status}${description}${transactionDateTime}${CHECKSUM_KEY}`;
      const hash = crypto.createHash('sha256').update(rawString).digest('hex');

      if (hash !== checksum) {
        return { success: false, message: 'Invalid checksum' };
      }

      const payment = await this.paymentRepository.findOne({
        where: { id: orderCode },
        relations: ['bill'],
      });
      if (!payment) return { success: false, message: 'Payment not found' };

      if (status === 'PAID' || status === 'SUCCESS') {
        payment.payment_status = PaymentStatus.SUCCESS;
        await this.paymentRepository.save(payment);

        payment.bill.total = Number(payment.bill.total) + Number(amount);
        await this.billRepository.save(payment.bill);

        return { success: true, message: 'Payment updated to SUCCESS' };
      } else if (status === 'CANCELLED' || status === 'FAILED') {
        payment.payment_status = PaymentStatus.FAILED;
        await this.paymentRepository.save(payment);
        return { success: true, message: 'Payment updated to FAILED' };
      }

      return { success: false, message: 'Unknown status' };
    }

    async createCashPayment(dto: GeneratePaymentQRDto) {
        const bill = await this.billRepository.findOne({
            where: { id: dto.bill_id },
            relations: ["patient", "patient.user"],
        });
        if (!bill) throw new NotFoundException("Bill not found");

        const patient = bill.patient;
        if (!patient) throw new NotFoundException("Patient not found");

        // Nếu bệnh nhân có tài khoản thì dùng user, nếu không thì lưu trực tiếp patient
        const payment = this.paymentRepository.create({
            bill,
            amount: dto.amount ?? bill.total,
            payment_method: PaymentMethod.CASH,
            payment_status: PaymentStatus.SUCCESS,
            paidByUser: patient.user || null,
            paidByPatient: patient.user ? null : patient,
        });
        return await this.paymentRepository.save(payment);
    }

}
