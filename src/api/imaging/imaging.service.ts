import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageResult } from "../../shared/entities/image-result.entity";
import { IndicationTicket } from "../../shared/entities/indication-ticket.entity";
import { Staff } from "../../shared/entities/staff.entity";
import { Patient } from "../../shared/entities/patient.entity";
import { Repository } from "typeorm";
import { CreateImageResultDto } from "./dto/create-image-result.dto";
import { DoctorType } from "src/shared/enums/doctor-type.enum";
import { ServiceIndication } from "src/shared/entities/service-indication.entity";

@Injectable()
export class ImagingService {
    constructor(
        @InjectRepository(ImageResult)
        private readonly imageResultRepository: Repository<ImageResult>,
        @InjectRepository(IndicationTicket)
        private readonly indicationTicketRepository: Repository<IndicationTicket>,
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(ServiceIndication)
        private readonly serviceIndicationRepository: Repository<ServiceIndication>
    ) {}

    async createXrayResult(
        userId: string,
        dto: CreateImageResultDto,
        files: Express.Multer.File[]
    ) {
        // Check doctor is DIAGNOSTIC
        const doctor = await this.staffRepository.findOne({
            where: { user: { id: userId } },
            relations: ["user"],
        });
        if (!doctor || doctor.doctor_type !== DoctorType.DIAGNOSTIC) {
            throw new ForbiddenException(
                "Only diagnostic doctors can upload X-ray results"
            );
        }

        if (!files || files.length === 0) {
            throw new BadRequestException(
                "At least one image file is required"
            );
        }

        const indication = await this.indicationTicketRepository.findOne({
            where: { id: dto.indication_id },
            relations: ["patient", "doctor"],
        });
        if (!indication)
            throw new NotFoundException("Indication ticket not found");

        // Save multiple image results (one per file)
        const imageResults: ImageResult[] = [];
        for (const file of files) {
            const imageResult = this.imageResultRepository.create({
                indication,
                doctor,
                patient: indication.patient,
                barcode: `XRAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${indication.id.slice(0, 8)}`,
                result: dto.result ?? dto.description ?? undefined,
                conclusion: dto.conclusion ?? undefined,
                image_url: `/uploads/xray/${file.filename}`,
            });
            const saved = await this.imageResultRepository.save(imageResult);
            imageResults.push(saved);
        }

        // Cập nhật trạng thái phiếu chỉ định là đã hoàn thành
        indication.is_completed = true;
        await this.indicationTicketRepository.save(indication);

        // Optionally: Notify patient and clinical doctor (e.g., via event, notification, or status update)

        return {
            message: "X-ray results uploaded successfully",
            imageResultIds: imageResults.map((r) => r.id),
            image_urls: imageResults.map((r) => r.image_url),
            barcodes: imageResults.map((r) => r.barcode),
            count: imageResults.length,
            indication_completed: true,
        };
    }

    async getResultsByPatient(patientId: string) {
        return this.imageResultRepository.find({
            where: { patient: { id: patientId } },
            relations: ["indication", "doctor"],
            order: { created_at: "DESC" },
        });
    }

    async getResultsByIndication(indicationId: string) {
        return this.imageResultRepository.find({
            where: { indication: { id: indicationId } },
            relations: ["patient", "doctor"],
            order: { created_at: "DESC" },
        });
    }

    // --- Diagnostic doctor: list indications to process ---
    async getIndicationsForDiagnosticDoctor(userId: string) {
        const doctor = await this.staffRepository.findOne({
            where: { user: { id: userId } },
            relations: ["user"],
        });
        if (!doctor || doctor.doctor_type !== DoctorType.DIAGNOSTIC) {
            throw new ForbiddenException(
                "Only diagnostic doctors can view imaging indications"
            );
        }

        const indications = await this.indicationTicketRepository.find({
            relations: [
                "patient",
                "doctor",
                "doctor.user",
                "serviceItems",
                "serviceItems.medical_service",
            ],
            order: { indication_date: "DESC" },
        });

        return indications.map((indication) => ({
            id: indication.id,
            barcode: indication.barcode,
            patient: indication.patient && {
                id: indication.patient.id,
                patient_full_name: indication.patient.patient_full_name,
                patient_dob: indication.patient.patient_dob,
                patient_phone: indication.patient.patient_phone,
                patient_address: indication.patient.patient_address,
                patient_gender: indication.patient.patient_gender,
            },
            doctor: indication.doctor && {
                id: indication.doctor.id,
                user: { full_name: indication.doctor.user?.full_name },
            },
            diagnosis: indication.diagnosis,
            indication_date: indication.indication_date,
            total_fee: indication.total_fee,
            serviceItems: (indication.serviceItems || []).map((s) => ({
                id: s.id,
                quantity: s.quantity,
                medical_service: s.medical_service
                    ? {
                          id: s.medical_service.id,
                          name: s.medical_service.service_name,
                          description: s.medical_service.description,
                      }
                    : null,
            })),
        }));
    }

    // Diagnostic doctor: indication detail with related results
    async getIndicationDetail(userId: string, indicationId: string) {
        const doctor = await this.staffRepository.findOne({
            where: { user: { id: userId } },
            relations: ["user"],
        });
        if (!doctor || doctor.doctor_type !== DoctorType.DIAGNOSTIC) {
            throw new ForbiddenException(
                "Only diagnostic doctors can view imaging indication detail"
            );
        }

        const indication = await this.indicationTicketRepository.findOne({
            where: { id: indicationId },
            relations: [
                "patient",
                "doctor",
                "doctor.user",
                "serviceItems",
                "serviceItems.medical_service",
            ],
        });

        if (!indication)
            throw new NotFoundException("Indication ticket not found");

        return {
            id: indication.id,
            barcode: indication.barcode,
            diagnosis: indication.diagnosis,
            indication_date: indication.indication_date,
            total_fee: indication.total_fee,
            patient: indication.patient && {
                id: indication.patient.id,
                patient_full_name: indication.patient.patient_full_name,
                patient_dob: indication.patient.patient_dob,
                patient_phone: indication.patient.patient_phone,
                patient_address: indication.patient.patient_address,
                patient_gender: indication.patient.patient_gender,
            },
            doctor: indication.doctor && {
                id: indication.doctor.id,
                user: { full_name: indication.doctor.user?.full_name },
            },
            serviceItems: (indication.serviceItems || []).map((s) => ({
                id: s.id,
                quantity: s.quantity,
                medical_service: s.medical_service
                    ? {
                          id: s.medical_service.id,
                          name: s.medical_service.service_name,
                          description: s.medical_service.description,
                      }
                    : null,
            })),
        };
    }

    // Get completed results for diagnostic doctor
    async getCompletedResultsForDiagnosticDoctor(userId: string) {
        const doctor = await this.staffRepository.findOne({
            where: { user: { id: userId } },
            relations: ["user"],
        });
        if (!doctor || doctor.doctor_type !== DoctorType.DIAGNOSTIC) {
            throw new ForbiddenException(
                "Only diagnostic doctors can view completed results"
            );
        }

        const results = await this.imageResultRepository.find({
            relations: [
                "indication",
                "indication.serviceItems",
                "indication.serviceItems.medical_service",
                "patient",
                "doctor",
                "doctor.user",
            ],
            order: { created_at: "DESC" },
        });

        // Group results by indication
        type GroupedResult = {
            indication: {
                id: string;
                barcode: string;
                diagnosis: string;
                indication_date: Date;
            };
            patient: {
                id: string;
                patient_full_name: string;
                patient_dob: Date;
                patient_phone: string;
                patient_address: string;
                patient_gender: string;
            } | null;
            doctor: {
                id: string;
                user: { full_name: string };
            } | null;
            serviceNames: string[];
            images: string[];
            description: string;
            conclusion: string;
            created_at: Date;
            barcode: string;
        };

        const indicationMap = new Map<string, GroupedResult>();
        results.forEach((result) => {
            const indicationId = result.indication.id;
            if (!indicationMap.has(indicationId)) {
                indicationMap.set(indicationId, {
                    indication: {
                        id: result.indication.id,
                        barcode: result.indication.barcode,
                        diagnosis: result.indication.diagnosis,
                        indication_date: result.indication.indication_date,
                    },
                    patient: result.patient
                        ? {
                              id: result.patient.id,
                              patient_full_name:
                                  result.patient.patient_full_name,
                              patient_dob: result.patient.patient_dob,
                              patient_phone: result.patient.patient_phone,
                              patient_address: result.patient.patient_address,
                              patient_gender: result.patient.patient_gender,
                          }
                        : null,
                    doctor: result.doctor
                        ? {
                              id: result.doctor.id,
                              user: {
                                  full_name:
                                      result.doctor.user?.full_name || "",
                              },
                          }
                        : null,
                    serviceNames: (result.indication.serviceItems || [])
                        .map((s) => s.medical_service?.service_name)
                        .filter((name): name is string => Boolean(name)),
                    images: [],
                    description: result.result || "",
                    conclusion: result.conclusion || "",
                    created_at: result.created_at,
                    barcode: result.barcode || "",
                });
            }
            const grouped = indicationMap.get(indicationId);
            if (grouped && result.image_url) {
                grouped.images.push(result.image_url);
            }
            // Use the most recent conclusion and description
            if (grouped && result.created_at > grouped.created_at) {
                grouped.description = result.result || grouped.description;
                grouped.conclusion = result.conclusion || grouped.conclusion;
                grouped.created_at = result.created_at;
                grouped.barcode = result.barcode || grouped.barcode;
            }
        });

        return Array.from(indicationMap.values());
    }
}
