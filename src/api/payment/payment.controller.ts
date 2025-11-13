import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/guards/roles.decorator";
import { GeneratePaymentQRDto } from "./dto/generate-payment-qr.dto";

@ApiTags("payment")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("api/v1/payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post("vietqr/create")
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

    @Post("cash/create")
    @ApiOperation({
        summary: "RECEPTIONIST payment for patient bill",
        description: "Trả về trạng thái thanh toán thành công"
    })
    @ApiBody({ type: GeneratePaymentQRDto })
    @Roles("RECEPTIONIST")
    async createCashPayment(@Body() dto: GeneratePaymentQRDto) {
        return this.paymentService.createCashPayment(dto);
    }

    @Post("vietqr/webhook")
    @ApiOperation({ summary: "VietQR WebHook to receive payment notification" })
    @UseGuards()
    async vietqrWebhook(@Body() body: any) {
        console.log("Received VietQR Webhook body:", body);
        return this.paymentService.handleVietQRWebhook(body);
    }

}
