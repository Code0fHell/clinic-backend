import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "../../shared/entities/payment.entity";
import { Bill } from "../../shared/entities/bill.entity";
import { User } from "../../shared/entities/user.entity";
import { Repository } from "typeorm";
import { GeneratePaymentQRDto } from "./dto/generate-payment-qr.dto";
import { PaymentStatus } from "../../shared/enums/payment-status.enum";
import { PaymentMethod } from "../../shared/enums/payment-method.enum";
import { Patient } from "../../shared/entities/patient.entity";
import axios from "axios";
import { generateSignature } from './payos-utils';
import { verifyWebhookSignature } from "./verifyWebhookSignature";

@Injectable()
export class PaymentService {
  private readonly PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID!;
  private readonly PAYOS_API_KEY = process.env.PAYOS_API_KEY!;
  private readonly PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY!;
  private readonly PAYOS_BASE_URL = `https://api-merchant.payos.vn/v2/payment-requests`;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>
  ) { }

  async createVietQRPayment(dto: GeneratePaymentQRDto) {
    const bill = await this.billRepository.findOne({
      where: { id: dto.bill_id },
      relations: ['patient', 'patient.user'],
    });

    if (!bill) throw new NotFoundException('Bill not found');
    if (!bill.patient) throw new NotFoundException('Patient not found');

    const payment = this.paymentRepository.create({
      bill,
      amount: dto.amount,
      payment_method: PaymentMethod.BANK_TRANSFER,
      payment_status: PaymentStatus.PENDING,
      paidByUser: bill.patient.user || null,
      paidByPatient: bill.patient.user ? null : bill.patient,
    });

    await this.paymentRepository.save(payment);

    // ÉP SỐ NGUYÊN
    const amount = Math.floor(Number(dto.amount));
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Số tiền không hợp lệ');
    }

    // Tạo orderCode chuẩn format PayOS
    const orderCode = Number(
      Date.now().toString().slice(-10) +
      String(Math.floor(Math.random() * 99)).padStart(2, '0')
    );

    const body = {
      orderCode,
      amount,
      description: `Thanh toan hoa don`,
      returnUrl: 'https://example.com/return',
      cancelUrl: 'https://example.com/cancel',
    };

    // ---  Tạo signature CHUẨN PayOS ---
    const signature = generateSignature(body, this.PAYOS_CHECKSUM_KEY);

    // console.log("Body gửi PayOS:", JSON.stringify(body, null, 2));
    // console.log("Signature:", signature);

    const response = await axios.post(
      this.PAYOS_BASE_URL,
      { ...body, signature },
      {
        headers: {
          'x-client-id': this.PAYOS_CLIENT_ID,
          'x-api-key': this.PAYOS_API_KEY,
        }
      }
    );

    // console.log("PayOS Response:", JSON.stringify(response.data, null, 2));

    if (response.data.code !== "00" || !response.data.data) {
      throw new BadRequestException(`PayOS Error: ${JSON.stringify(response.data)}`);
    }

    const data = response.data.data;

    payment.transaction_id = orderCode.toString();
    await this.paymentRepository.save(payment);

    return {
      paymentId: payment.id,
      orderCode,
      checkoutUrl: data.checkoutUrl,
      qrCode: data.qrCode,
      amount,
      bill_id: bill.id,
      message: 'QR VietQR đã tạo thành công!',
    };
  }

  async getPaymentStatus(orderCode: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transaction_id: orderCode },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      paymentId: payment.id,
      orderCode,
      payment_status: payment.payment_status,
      amount: payment.amount,
      payment_method: payment.payment_method,
      paid_at: payment.paid_at,
    };
  }

  async handleVietQRWebhook(rawBody: string) {
    // console.log("RAW BODY RECEIVED IN SERVICE:", rawBody);

    const verify = verifyWebhookSignature(rawBody, this.PAYOS_CHECKSUM_KEY);
    // console.log("VERIFY RESULT:", verify);

    if (!verify.success) {
      // console.log("VERIFY FAILED:", verify.message);
      return { success: false, message: verify.message };
    }

    // console.log("VERIFY OK");

    const body = verify.body;
    const orderCode = body.data.orderCode.toString();

    const payment = await this.paymentRepository.findOne({
      where: { transaction_id: orderCode }
    });

    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }

    if (payment.payment_status === PaymentStatus.SUCCESS) {
      return { success: true, message: 'Already processed' };
    }

    payment.payment_status = PaymentStatus.SUCCESS;
    payment.paid_at = new Date();
    await this.paymentRepository.save(payment);

    return { success: true, message: 'Payment confirmed!' };
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
