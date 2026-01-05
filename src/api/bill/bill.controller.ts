import { Controller, Post, Get, Body, UseGuards, Param, Query } from "@nestjs/common";
import { BillService } from "./bill.service";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/guards/roles.decorator";
import { CreateBillDto } from "./dto/create-bill.dto";
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { QueryBillTodayDTO } from "./dto/query-bill-today.dto";
import { QueryPrescriptionBillDto } from "./dto/query-prescription-bill.dto";
import { QueryBillDashboardDTO } from "./dto/query-bill-dashboard.dto";

@ApiTags("bill")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("api/v1/bill")
export class BillController {
    constructor(private readonly billService: BillService) { }

    @Post()
    @ApiOperation({
        summary: "Create bill for patient",
        description: `
      - CLINICAL: Paid after medical ticket created (provide medicalTicket_id)
      - SERVICE: Paid after indication ticket created (provide indication_ticket_id)
      - MEDICINE: Paid after prescription created (provide prescription_id)
    `,
    })
    @ApiBody({ type: CreateBillDto })
    @Roles("RECEPTIONIST")
    async createBill(@Body() dto: CreateBillDto) {
        return this.billService.createBill(dto);
    }

    @Get("/all-bill-today")
    @ApiOperation({
        summary: "Lấy tất cả Bill",
    })
    @Roles("RECEPTIONIST")
    async getAllBillToday(
        @CurrentUser() user: any, // hoặc @Req() req: Request)
        @Query() dto: QueryBillTodayDTO
    ) {
        return this.billService.getAllBillToday(user, dto);
    }

    @Get("/:billId")
    @ApiOperation({
        summary: "Lấy chi tiết Bill",
    })
    @Roles("RECEPTIONIST")
    async getDetailBill(@Param('billId') billId: string) {
        return this.billService.getDetailBill(billId);
    }

    @Get("/prescription/list")
    @ApiOperation({
        summary: "Lấy danh sách hóa đơn thuốc với filters (cho dược sĩ)",
    })
    @Roles("PHARMACIST", "OWNER")
    async getPrescriptionBills(@Query() dto: QueryPrescriptionBillDto) {
        return this.billService.getPrescriptionBills(dto);
    }
    @Get("dashboard/count")
    @ApiOperation({
        summary: "Đếm Bill",
    })
    @Roles("RECEPTIONIST")
    async getCountBillToday() {
        return this.billService.getCountBillToday();
    }

    @Get('dashboard/payment-report')
    @ApiOperation({
        summary: 'Danh sách bệnh nhân đã thanh toán (dashboard lễ tân)',
    })
    @Roles('RECEPTIONIST')
    async getPaymentReport(@Query() dto: QueryBillDashboardDTO ) {
        return this.billService.getPaymentReport(dto);
    }

}
