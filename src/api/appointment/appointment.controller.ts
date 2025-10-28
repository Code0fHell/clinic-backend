import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Req,
    UseGuards,
    Put,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { BookAppointmentDto } from "./dto/book-appointment.dto";
import { GuestBookAppointmentDto } from "./dto/guest-book-appointment.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/guards/roles.decorator";
import { AppointmentStatus } from "src/shared/enums/appointment-status.enum";

@ApiTags("appointment")
@ApiBearerAuth()
@Controller("api/v1/appointment")
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    @Get("work-schedule/:id/slots")
    @ApiOperation({ summary: "Get available slots for a work schedule" })
    async getAvailableSlots(@Param("id") scheduleId: string) {
        return this.appointmentService.getAvailableSlots(scheduleId);
    }

    @Post("book") // Api dành cho bệnh nhân đã đăng nhập
    @Roles("PATIENT")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Book an appointment" })
    async bookAppointment(@Req() req, @Body() dto: BookAppointmentDto) {
        const patientId = req.user.userId;
        return this.appointmentService.bookAppointment(patientId, dto);
    }

    @Post("guest-book") // Api dành cho khách hàng không đăng nhập
    @ApiOperation({ summary: "Guest book an appointment (no login required)" })
    async guestBookAppointment(@Body() dto: GuestBookAppointmentDto) {
        return this.appointmentService.guestBookAppointment(dto);
    }

    @Get("all") // API lấy tất cả cuộc hẹn
    @ApiOperation({ summary: "Get all appointments" })
    async getAllAppointments() {
    return this.appointmentService.getAllAppointments();
    }

    @Get("today") // API lấy ra cuộc hẹn trong ngày dành cho bác sĩ
    @ApiOperation({ summary: "Get today's appointments" })
    async getTodayAppointments() {
    return this.appointmentService.getTodayAppointments();
    }

    @Put(":id/status") // API cập nhật trạng thái cuộc hẹn
    @ApiOperation( { summary: "Update appointment status"})
    async updateAppointmentStatus(@Param("id") appointmentId: string, @Body("appointment_status") appointmentStatus: AppointmentStatus) {
        return this.appointmentService.updateAppointmentStatus(appointmentId, appointmentStatus);
    }
}
