import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Req,
    UseGuards,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { BookAppointmentDto } from "./dto/book-appointment.dto";

@ApiTags("appointment")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("api/v1/appointment")
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    @Get("work-schedule/:id/slots")
    @ApiOperation({ summary: "Get available slots for a work schedule" })
    async getAvailableSlots(@Param("id") scheduleId: string) {
        return this.appointmentService.getAvailableSlots(scheduleId);
    }

    @Post("book")
    @ApiOperation({ summary: "Book an appointment" })
    async bookAppointment(@Req() req, @Body() dto: BookAppointmentDto) {
        const patientId = req.user.userId;
        return this.appointmentService.bookAppointment(patientId, dto);
    }
}
