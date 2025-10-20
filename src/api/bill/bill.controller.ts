import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { BillService } from "./bill.service";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/guards/roles.decorator";
import { CreateBillDto } from "./dto/create-bill.dto";

@ApiTags("bill")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("api/v1/bill")
export class BillController {
    constructor(private readonly billService: BillService) {}

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
}
