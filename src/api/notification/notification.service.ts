import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "../../shared/entities/notification.entity";
import { User } from "../../shared/entities/user.entity";
import { Appointment } from "../../shared/entities/appointment.entity";
import { AppointmentStatus } from "../../shared/enums/appointment-status.enum";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>
    ) {}

    async createAppointmentNotification(
        userId: string,
        appointmentId: string,
        scheduledDate: Date,
        status: AppointmentStatus
    ) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException("User not found");

        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointmentId },
            relations: ["doctor", "doctor.user"],
        });
        if (!appointment) throw new NotFoundException("Appointment not found");

        // Format scheduled date to Vietnamese format
        const formattedDate = dayjs(scheduledDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("HH:mm DD/MM/YYYY");

        const statusLabel = this.mapStatus(status);

        const notification = this.notificationRepository.create({
            user,
            appointment,
            title: "Đặt lịch hẹn thành công",
            message: `Lịch hẹn lúc ${formattedDate} đã được đặt thành công. Trạng thái hiện tại: ${statusLabel}.`,
            type: "APPOINTMENT",
            is_read: false,
        });

        return await this.notificationRepository.save(notification);
    }

    async getUserNotifications(userId: string) {
        return this.notificationRepository.find({
            where: { user: { id: userId } },
            relations: [
                "appointment",
                "appointment.doctor",
                "appointment.doctor.user",
            ],
            order: { created_at: "DESC" },
        });
    }

    async getUnreadCount(userId: string) {
        return this.notificationRepository.count({
            where: { user: { id: userId }, is_read: false },
        });
    }

    async markAsRead(notificationId: string, userId: string) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, user: { id: userId } },
        });
        if (!notification)
            throw new NotFoundException("Notification not found");

        notification.is_read = true;
        return await this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: string) {
        await this.notificationRepository.update(
            { user: { id: userId }, is_read: false },
            { is_read: true }
        );
        return { message: "All notifications marked as read" };
    }

    private mapStatus(status: AppointmentStatus): string {
        switch (status) {
            case AppointmentStatus.PENDING:
                return "chờ duyệt";
            case AppointmentStatus.CANCELLED:
                return "đã hủy";
            case AppointmentStatus.CHECKED_IN:
                return "đã check-in";
            case AppointmentStatus.DOING:
                return "đang khám";
            case AppointmentStatus.COMPLETED:
                return "hoàn tất";
            default:
                return status;
        }
    }
}
