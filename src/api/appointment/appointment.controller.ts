import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Req,
    UseGuards,
    Put,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BookAppointmentDto } from "./dto/book-appointment.dto";
import { GuestBookAppointmentDto } from "./dto/guest-book-appointment.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/guards/roles.decorator";
import { AppointmentStatus } from "src/shared/enums/appointment-status.enum";
import { Appointment } from "src/shared/entities/appointment.entity";

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
        const userId = req.user.id;
        return this.appointmentService.bookAppointment(userId, dto);
    }

    @Post("guest-book") // Api dành cho khách hàng không đăng nhập
    @ApiOperation({ summary: "Guest book an appointment (no login required)" })
    async guestBookAppointment(@Body() dto: GuestBookAppointmentDto) {
        return this.appointmentService.guestBookAppointment(dto);
    }

    @Get("my")
    @Roles("PATIENT")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Get appointments of current patient" })
    async getMyAppointments(@Req() req) {
        const userId = req.user.id;
        return this.appointmentService.getAppointmentsForPatient(userId);
    }

    @Get("all") // API lấy tất cả cuộc hẹn
    @ApiOperation({ summary: "Get all appointments" })
    async getAllAppointments() {
        return this.appointmentService.getAllAppointments();
    }

    @Get("today") // API lấy ra cuộc hẹn trong ngày dành cho bác sĩ và lễ tân
    @Roles("DOCTOR", "RECEPTIONIST")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({
        summary: "Get today's appointments for the authenticated doctor or receptionist",
        description: "Doctors get their own appointments. Receptionists get all appointments scheduled for today.",
    })
    async getTodayAppointments(@Req() req) {
        const userId = req.user.id;
        return this.appointmentService.getTodayAppointments(userId);
    }

    @Get("week")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lấy danh sách lịch hẹn trong tuần hiện tại (Thứ 2 → Thứ 6)" })
    @ApiResponse({
        status: 200,
        description: "Danh sách lịch hẹn trong tuần",
        type: [Appointment],
    })
    async getAppointmentsThisWeek() {
        return this.appointmentService.getAppointmentsThisWeek();
    }

    @Put(":id/status") // API cập nhật trạng thái cuộc hẹn
    @ApiOperation( { summary: "Update appointment status"})
    async updateAppointmentStatus(@Param("id") appointmentId: string, @Body("appointment_status") appointmentStatus: AppointmentStatus) {
        return this.appointmentService.updateAppointmentStatus(appointmentId, appointmentStatus);
    }

    @Put(":id/cancel")
    @Roles("PATIENT")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Patient cancel own appointment" })
    async cancelMyAppointment(@Req() req, @Param("id") appointmentId: string) {
        const userId = req.user.id;
        return this.appointmentService.cancelAppointment(userId, appointmentId);
    }
}
