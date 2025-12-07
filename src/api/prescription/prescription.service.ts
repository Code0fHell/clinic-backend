import {
    BadRequestException,
    Injectable,
    NotFoundException,
    Inject,
    forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { UpdatePrescriptionDto } from "./dto/update-prescription.dto";
import { Prescription } from "../../shared/entities/prescription.entity";
import { Patient } from "../../shared/entities/patient.entity";
import { Staff } from "../../shared/entities/staff.entity";
import { MedicalRecord } from "../../shared/entities/medical-record.entity";
import { Medicine } from "src/shared/entities/medicine.entity";
import { PrescriptionDetail } from "src/shared/entities/prescription-detail.entity";
import { NotificationService } from "../notification/notification.service";
import { PrescriptionStatus } from "src/shared/enums/prescription-status.enum";

@Injectable()
export class PrescriptionService {
    constructor(
        @InjectRepository(Prescription)
        private readonly prescriptionRepository: Repository<Prescription>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,
        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(Medicine)
        private readonly medicineRepository: Repository<Medicine>,
        @InjectRepository(PrescriptionDetail)
        private readonly detailRepository: Repository<PrescriptionDetail>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService
    ) {}

    // Tạo đơn thuốc mới
    async create(dto: CreatePrescriptionDto) {
        const {
            patient_id,
            doctor_id,
            medical_record_id,
            conclusion,
            return_date,
            medicine_items,
        } = dto;

        // Validate patient and doctor
        const patient = await this.patientRepository.findOne({
            where: { id: patient_id },
        });
        if (!patient) throw new NotFoundException("Bệnh nhân không tồn tại");

        const doctor = await this.staffRepository.findOne({
            where: { id: doctor_id },
            relations: ["user"],
        });
        if (!doctor) throw new NotFoundException("Bác sĩ không tồn tại");

        // Create or get medical record
        let medicalRecord: MedicalRecord | null = null;
        if (medical_record_id) {
            medicalRecord = await this.medicalRecordRepository.findOne({
                where: { id: medical_record_id },
            });
            if (!medicalRecord)
                throw new NotFoundException("Hồ sơ bệnh án không tồn tại");
        } else {
            medicalRecord = this.medicalRecordRepository.create({
                patient,
                doctor,
                created_at: new Date(),
                updated_at: new Date(),
            });
            await this.medicalRecordRepository.save(medicalRecord);
        }

        // Create prescription
        const prescription = this.prescriptionRepository.create({
            patient,
            doctor,
            medical_record: medicalRecord,
            conclusion,
            return_date: return_date ? new Date(return_date) : null,
            created_at: new Date(),
            total_fee: 0,
            status: PrescriptionStatus.PENDING,
        });

        await this.prescriptionRepository.save(prescription);

        // Create prescription details if medicine_items provided
        const prescriptionDetails: PrescriptionDetail[] = [];
        let totalFee = 0;

        if (medicine_items && medicine_items.length > 0) {
            for (const item of medicine_items) {
                const medicine = await this.medicineRepository.findOne({
                    where: { id: item.medicine_id },
                });
                if (!medicine) {
                    throw new NotFoundException(
                        `Thuốc với id: ${item.medicine_id} không tồn tại`
                    );
                }

                const detail = this.detailRepository.create({
                    prescription,
                    medicine,
                    quantity: item.quantity,
                    dosage: item.dosage || "",
                });

                const savedDetail = await this.detailRepository.save(detail);
                prescriptionDetails.push(savedDetail);
                totalFee += Number(medicine.price || 0) * item.quantity;
            }

            // Update prescription total_fee
            prescription.total_fee = totalFee;
            await this.prescriptionRepository.save(prescription);
        }

        // Fetch full prescription with relations
        const fullPrescription = await this.prescriptionRepository.findOne({
            where: { id: prescription.id },
            relations: [
                "patient",
                "patient.user",
                "doctor",
                "doctor.user",
                "medical_record",
                "details",
                "details.medicine",
            ],
        });

        if (!fullPrescription) {
            throw new NotFoundException("Không tìm thấy đơn thuốc vừa tạo");
        }

        // Create notification for pharmacists
        try {
            const patientName =
                fullPrescription.patient?.user?.full_name || "Bệnh nhân";
            const doctorName =
                fullPrescription.doctor?.user?.full_name || "Bác sĩ";
            await this.notificationService.createPrescriptionNotification(
                prescription.id,
                patientName,
                doctorName
            );
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            console.error(
                "Error creating prescription notification:",
                errorMessage
            );
            // Don't fail the prescription creation if notification fails
        }

        return {
            message: "Tạo đơn thuốc thành công",
            prescription_id: prescription.id,
            data: fullPrescription,
        };
    }

    // Lấy tất cả đơn thuốc
    async findAll() {
        const prescriptions = await this.prescriptionRepository.find({
            relations: ["patient", "doctor", "medical_record", "details"],
        });
        if (!prescriptions.length)
            throw new NotFoundException("Chưa có đơn thuốc nào trong hệ thống");
        return {
            message: "Lấy danh sách đơn thuốc thành công",
            data: prescriptions,
        };
    }

    // Lấy đơn thuốc theo ID
    async findOne(id: string) {
        const prescription = await this.prescriptionRepository.findOne({
            where: { id },
            relations: ["patient", "doctor", "medical_record", "details"],
        });
        if (!prescription)
            throw new NotFoundException(
                `Đơn thuốc với id: ${id} không tồn tại`
            );
        return {
            message: "Lấy thông tin đơn thuốc thành công",
            data: prescription,
        };
    }

    // Lấy đơn thuốc theo bệnh nhân
    async findByPatient(patientId: string) {
        const prescriptions = await this.prescriptionRepository.find({
            where: { patient: { id: patientId } },
            relations: ["patient", "doctor", "medical_record", "details"],
        });
        if (!prescriptions.length)
            throw new NotFoundException(
                `Không tìm thấy đơn thuốc nào cho bệnh nhân với id: ${patientId}`
            );
        return {
            message: "Lấy danh sách đơn thuốc theo bệnh nhân thành công",
            data: prescriptions,
        };
    }

    // Cập nhật đơn thuốc
    async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto) {
        if (
            updatePrescriptionDto.total_fee !== undefined &&
            updatePrescriptionDto.total_fee < 0
        ) {
            throw new BadRequestException("Tổng phí không được âm");
        }

        const prescription = await this.prescriptionRepository.findOne({
            where: { id },
            relations: ["patient", "doctor", "medical_record"],
        });
        if (!prescription)
            throw new NotFoundException(
                `Đơn thuốc với id: ${id} không tồn tại`
            );

        if (updatePrescriptionDto.patient_id) {
            const patient = await this.patientRepository.findOne({
                where: { id: updatePrescriptionDto.patient_id },
            });
            if (!patient)
                throw new NotFoundException(
                    `Bệnh nhân với id: ${updatePrescriptionDto.patient_id} không tồn tại`
                );
            prescription.patient = patient;
        }

        if (updatePrescriptionDto.doctor_id) {
            const doctor = await this.staffRepository.findOne({
                where: { id: updatePrescriptionDto.doctor_id },
            });
            if (!doctor)
                throw new NotFoundException(
                    `Bác sĩ với id: ${updatePrescriptionDto.doctor_id} không tồn tại`
                );
            prescription.doctor = doctor;
        }

        if (updatePrescriptionDto.medical_record_id) {
            const medicalRecord = await this.medicalRecordRepository.findOne({
                where: { id: updatePrescriptionDto.medical_record_id },
            });
            if (!medicalRecord)
                throw new NotFoundException(
                    `Hồ sơ bệnh án với id: ${updatePrescriptionDto.medical_record_id} không tồn tại`
                );
            prescription.medical_record = medicalRecord;
        }

        if (updatePrescriptionDto.conclusion !== undefined)
            prescription.conclusion = updatePrescriptionDto.conclusion;
        if (updatePrescriptionDto.total_fee !== undefined)
            prescription.total_fee = updatePrescriptionDto.total_fee;
        if (updatePrescriptionDto.return_date !== undefined)
            prescription.return_date = updatePrescriptionDto.return_date
                ? new Date(updatePrescriptionDto.return_date)
                : null;

        const updatedPrescription =
            await this.prescriptionRepository.save(prescription);
        return {
            message: "Cập nhật đơn thuốc thành công",
            data: updatedPrescription,
        };
    }

    // Xóa đơn thuốc
    async remove(id: string) {
        const prescription = await this.prescriptionRepository.findOne({
            where: { id },
        });
        if (!prescription)
            throw new NotFoundException(
                `Đơn thuốc với id: ${id} không tồn tại`
            );
        await this.prescriptionRepository.remove(prescription);
        return { message: "Xóa đơn thuốc thành công", data: prescription };
    }

    // Lấy danh sách đơn thuốc chờ duyệt
    async findPendingPrescriptions() {
        const prescriptions = await this.prescriptionRepository.find({
            where: { status: PrescriptionStatus.PENDING },
            relations: [
                "patient",
                "patient.user",
                "doctor",
                "doctor.user",
                "medical_record",
                "details",
                "details.medicine",
            ],
            order: { created_at: "DESC" },
        });
        return {
            message: "Lấy danh sách đơn thuốc chờ duyệt thành công",
            data: prescriptions,
        };
    }

    // Duyệt đơn thuốc và cập nhật tồn kho
    async approvePrescription(prescriptionId: string, userId: string) {
        // Find prescription with details
        const prescription = await this.prescriptionRepository.findOne({
            where: { id: prescriptionId },
            relations: ["details", "details.medicine", "approved_by"],
        });

        if (!prescription) {
            throw new NotFoundException(
                `Đơn thuốc với id: ${prescriptionId} không tồn tại`
            );
        }

        if (prescription.status !== PrescriptionStatus.PENDING) {
            throw new BadRequestException(
                `Đơn thuốc này đã được xử lý (${prescription.status})`
            );
        }

        // Find pharmacist by user ID
        const pharmacist = await this.staffRepository.findOne({
            where: { user: { id: userId } },
            relations: ["user"],
        });

        if (!pharmacist) {
            throw new NotFoundException("Không tìm thấy dược sĩ");
        }

        // Check and update stock for each medicine
        for (const detail of prescription.details || []) {
            const medicine = detail.medicine;
            if (!medicine) {
                throw new NotFoundException(
                    `Không tìm thấy thuốc trong chi tiết đơn thuốc`
                );
            }

            const currentStock = Number(medicine.stock || 0);
            const requiredQuantity = Number(detail.quantity || 0);

            if (currentStock < requiredQuantity) {
                throw new BadRequestException(
                    `Thuốc ${medicine.name} không đủ tồn kho. Cần: ${requiredQuantity}, Hiện có: ${currentStock}`
                );
            }

            // Update stock
            medicine.stock = currentStock - requiredQuantity;
            await this.medicineRepository.save(medicine);
        }

        // Update prescription status
        prescription.status = PrescriptionStatus.APPROVED;
        prescription.approved_by = pharmacist;
        prescription.approved_at = new Date();

        await this.prescriptionRepository.save(prescription);

        // Fetch full prescription with relations
        const fullPrescription = await this.prescriptionRepository.findOne({
            where: { id: prescriptionId },
            relations: [
                "patient",
                "patient.user",
                "doctor",
                "doctor.user",
                "approved_by",
                "approved_by.user",
                "medical_record",
                "details",
                "details.medicine",
            ],
        });

        return {
            message: "Duyệt đơn thuốc thành công",
            data: fullPrescription,
        };
    }

    // Lấy hoạt động gần đây của dược sĩ
    async getRecentActivity(userId: string) {
        // Find pharmacist by user ID
        const pharmacist = await this.staffRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!pharmacist) {
            throw new NotFoundException("Không tìm thấy dược sĩ");
        }

        const prescriptions = await this.prescriptionRepository.find({
            where: {
                approved_by: { id: pharmacist.id },
                status: PrescriptionStatus.APPROVED,
            },
            relations: [
                "patient",
                "patient.user",
                "doctor",
                "doctor.user",
                "details",
                "details.medicine",
            ],
            order: { approved_at: "DESC" },
            take: 10, // Lấy 10 đơn gần nhất
        });

        return {
            message: "Lấy hoạt động gần đây thành công",
            data: prescriptions,
        };
    }
}
