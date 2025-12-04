import { Controller, Post, Body, UseGuards, Req, Header, Get, Param } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/guards/roles.decorator";
import { GeneratePaymentQRDto } from "./dto/generate-payment-qr.dto";

@ApiTags("payment")
@ApiBearerAuth()
@Controller("api/v1/payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post("vietqr/create")
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @ApiOperation({
        summary: "RECEPTIONIST generates VietQR payment for patient bill",
        description:
            "Returns VietQR URL and QR code image (base64) for the patient to pay via bank transfer.",
    })
    @ApiBody({ type: GeneratePaymentQRDto })
    @Roles("RECEPTIONIST")
    async createVietQRPayment(@Body() dto: GeneratePaymentQRDto) {
        return this.paymentService.createVietQRPayment(dto);
    }

    @Get("status/:orderCode")
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @ApiOperation({
        summary: "Check payment status by order code",
        description: "Returns payment status for the given order code",
    })
    @Roles("RECEPTIONIST")
    async getPaymentStatus(@Param("orderCode") orderCode: string) {
        return this.paymentService.getPaymentStatus(orderCode);
    }

    @Post('vietqr/webhook')
    @ApiOperation({ summary: 'PayOS Webhook - nhận thông báo thanh toán VietQR' })
    @Header('Content-Type', 'application/json')
    async vietqrWebhook(@Req() req: Request) {
        const rawBody = (req as any).rawBody;

        const result = await this.paymentService.handleVietQRWebhook(rawBody);
        return {
            error: result.success ? 0 : -1,
            message: result.message,
            data: null,
        };
    }

    @Post("cash/create")
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @ApiOperation({
        summary: "RECEPTIONIST payment for patient bill",
        description: "Trả về trạng thái thanh toán thành công"
    })
    @ApiBody({ type: GeneratePaymentQRDto })
    @Roles("RECEPTIONIST")
    async createCashPayment(@Body() dto: GeneratePaymentQRDto) {
        return this.paymentService.createCashPayment(dto);
    }
}
