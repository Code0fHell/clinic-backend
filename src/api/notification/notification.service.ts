import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Notification } from "../../shared/entities/notification.entity";
import { User } from "../../shared/entities/user.entity";
import { Appointment } from "../../shared/entities/appointment.entity";
import { Staff } from "../../shared/entities/staff.entity";
import { UserRole } from "../../shared/enums/user-role.enum";
import { AppointmentStatus } from "../../shared/enums/appointment-status.enum";
import { DoctorType } from "../../shared/enums/doctor-type.enum";
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
        private readonly appointmentRepository: Repository<Appointment>,
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>
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

    async getUserNotifications(userId: string, userRole?: string) {
        // If user is PHARMACIST, only show PRESCRIPTION and OTHER notifications
        // Don't show APPOINTMENT notifications
        if (userRole === "PHARMACIST") {
            return this.notificationRepository.find({
                where: {
                    user: { id: userId },
                    type: In(["PRESCRIPTION", "OTHER"]),
                },
                relations: [
                    "appointment",
                    "appointment.doctor",
                    "appointment.doctor.user",
                ],
                order: { created_at: "DESC" },
            });
        }

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

    async createPrescriptionNotification(
        prescriptionId: string,
        patientName: string,
        doctorName: string
    ) {
        // Find all pharmacists
        const pharmacists = await this.staffRepository.find({
            where: { user: { user_role: UserRole.PHARMACIST } },
            relations: ["user"],
        });

        if (!pharmacists || pharmacists.length === 0) {
            return; // No pharmacists to notify
        }

        // Create notification for each pharmacist
        const notifications = pharmacists.map((pharmacist) => {
            return this.notificationRepository.create({
                user: pharmacist.user,
                appointment: null,
                title: "Đơn thuốc mới",
                message: `Có đơn thuốc mới từ bác sĩ ${doctorName} cho bệnh nhân ${patientName}. Mã đơn: ${prescriptionId.substring(0, 8)}...`,
                type: "PRESCRIPTION",
                is_read: false,
            });
        });

        await this.notificationRepository.save(notifications);
        return notifications;
    }

    async createIndicationNotification(
        indicationId: string,
        indicationBarcode: string,
        patientName: string,
        doctorName: string,
        roomTypes: string[] // ['DIAGNOSTIC', 'LAB'] hoặc cả hai
    ) {
        const notifications: Notification[] = [];

        // Notify diagnostic doctors if indication contains diagnostic services
        if (roomTypes.includes("DIAGNOSTIC")) {
            const diagnosticDoctors = await this.staffRepository.find({
                where: { doctor_type: DoctorType.DIAGNOSTIC },
                relations: ["user"],
            });

            if (diagnosticDoctors && diagnosticDoctors.length > 0) {
                const diagnosticNotifications = diagnosticDoctors.map(
                    (doctor) => {
                        return this.notificationRepository.create({
                            user: doctor.user,
                            appointment: null,
                            title: "Phiếu chỉ định chẩn đoán hình ảnh mới",
                            message: `Có phiếu chỉ định chẩn đoán hình ảnh mới từ bác sĩ ${doctorName} cho bệnh nhân ${patientName}. Mã phiếu: ${indicationBarcode}`,
                            type: "OTHER",
                            is_read: false,
                        });
                    }
                );
                notifications.push(...diagnosticNotifications);
            }
        }

        // Notify lab doctors if indication contains lab services
        if (roomTypes.includes("LAB")) {
            const labDoctors = await this.staffRepository.find({
                where: { doctor_type: DoctorType.LAB },
                relations: ["user"],
            });

            if (labDoctors && labDoctors.length > 0) {
                const labNotifications = labDoctors.map((doctor) => {
                    return this.notificationRepository.create({
                        user: doctor.user,
                        appointment: null,
                        title: "Phiếu chỉ định xét nghiệm mới",
                        message: `Có phiếu chỉ định xét nghiệm mới từ bác sĩ ${doctorName} cho bệnh nhân ${patientName}. Mã phiếu: ${indicationBarcode}`,
                        type: "OTHER",
                        is_read: false,
                    });
                });
                notifications.push(...labNotifications);
            }
        }

        if (notifications.length > 0) {
            await this.notificationRepository.save(notifications);
        }

        return notifications;
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
