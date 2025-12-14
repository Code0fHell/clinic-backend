import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IndicationTicket } from "../../shared/entities/indication-ticket.entity";
import { MedicalService } from "../../shared/entities/medical-service.entity";
import { ServiceIndication } from "../../shared/entities/service-indication.entity";
import { MedicalTicket } from "../../shared/entities/medical-ticket.entity";
import { Patient } from "../../shared/entities/patient.entity";
import { Staff } from "../../shared/entities/staff.entity";
import { Repository, Between } from "typeorm";
import { CreateIndicationTicketDto } from "./dto/create-indication-ticket.dto";
import { DoctorType } from "src/shared/enums/doctor-type.enum";
import { MedicalRecord } from "../../shared/entities/medical-record.entity";
import { IndicationType } from "src/shared/enums/indication-ticket-type.enum";
import { ServiceType } from "src/shared/enums/service-type.enum";

@Injectable()
export class IndicationService {
    constructor(
        @InjectRepository(IndicationTicket)
        private readonly indicationTicketRepository: Repository<IndicationTicket>,
        @InjectRepository(MedicalService)
        private readonly medicalServiceRepository: Repository<MedicalService>,
        @InjectRepository(ServiceIndication)
        private readonly serviceIndicationRepository: Repository<ServiceIndication>,
        @InjectRepository(MedicalTicket)
        private readonly medicalTicketRepository: Repository<MedicalTicket>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,
        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>
    ) {}

    private generateShortCode(length = 4) {
        return Array.from({ length })
            .map(() => Math.floor(Math.random() * 36).toString(36).toUpperCase())
            .join('');
    }
    // Tạo barcode ngắn: CD-YYYYMMDD-XXXX
    async generateUniqueBarcode(): Promise<string> {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

        let barcode: string;
        let exists: IndicationTicket | null;

        do {
            const randomCode = this.generateShortCode(4); // 4 ký tự
            barcode = `CD-${dateStr}-${randomCode}`;

            exists = await this.indicationTicketRepository.findOne({
                where: { barcode },
            });

        } while (exists);

        return barcode;
    }


    async createIndicationTicket(
        userId: string,
        dto: CreateIndicationTicketDto
    ) {
        // Tìm bác sĩ theo user_id
        const doctor = await this.staffRepository.findOne({
            where: { user: { id: userId } },
            relations: ["user"],
        });

        if (!doctor) throw new NotFoundException("Doctor not found");
        if (doctor.doctor_type !== DoctorType.CLINICAL)
            throw new ForbiddenException(
                "Only clinical doctors can create indication tickets"
            );

        const medicalTicket = await this.medicalTicketRepository.findOne({
            where: { id: dto.medical_ticket_id },
        });
        const patient = await this.patientRepository.findOne({
            where: { id: dto.patient_id },
        });
        if (!medicalTicket || !patient)
            throw new NotFoundException("Medical ticket or patient not found");

        // Tạo medical-record nếu chưa có
        let medicalRecord = await this.medicalRecordRepository.findOne({
            where: { patient: { id: patient.id } },
        });
        if (!medicalRecord) {
            medicalRecord = this.medicalRecordRepository.create({
                patient: patient,
                doctor: doctor,
                created_at: new Date(),
                updated_at: new Date(),
            });
            await this.medicalRecordRepository.save(medicalRecord);
        }

        // Xác định indication_type từ dto hoặc tự động từ service types
        let indicationType = dto.indication_type;
        
        if (!indicationType) {
            // Lấy thông tin các services để xác định type
            const services = await Promise.all(
                dto.medical_service_ids.map(id => 
                    this.medicalServiceRepository.findOne({ where: { id } })
                )
            );
            
            const serviceTypes = services
                .filter((s): s is MedicalService => s !== null)
                .map(s => s.service_type);
            
            // Ưu tiên IMAGING nếu có, không thì TEST, mặc định là TEST
            if (serviceTypes.includes(ServiceType.IMAGING)) {
                indicationType = IndicationType.IMAGING;
            } else if (serviceTypes.includes(ServiceType.TEST)) {
                indicationType = IndicationType.TEST;
            } else {
                indicationType = IndicationType.TEST; // Mặc định
            }
        }

        const indicationTicket = this.indicationTicketRepository.create({
            medical_ticket: medicalTicket,
            doctor: doctor,
            patient: patient,
            diagnosis: dto.diagnosis,
            indication_date: new Date(),
            total_fee: 0,
            indication_type: indicationType,
        });
        await this.indicationTicketRepository.save(indicationTicket);

        // 🔥 Tạo barcode ngắn – không trùng
        const barcode = await this.generateUniqueBarcode();
        indicationTicket.barcode = barcode;
        await this.indicationTicketRepository.save(indicationTicket);


        const serviceItems: {
            medical_service_id: string;
            service_name: string;
            room_name: string | null;
            queue_number: number;
            service_price: number;
        }[] = [];

        for (const serviceId of dto.medical_service_ids) {
            const medicalService = await this.medicalServiceRepository.findOne({
                where: { id: serviceId },
                relations: ["room"],
            });
            if (!medicalService) continue;

            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

            const queueNumber = await this.serviceIndicationRepository.count({
                where: {
                    medical_service: { room: { id: medicalService.room.id } },
                    created_at: Between(startOfDay, endOfDay),
                },
                relations: ["medical_service", "medical_service.room"],
            }) + 1;


            const serviceIndication = this.serviceIndicationRepository.create({
                indication: indicationTicket,
                medical_service: medicalService,
                quantity: 1,
                queue_number: queueNumber,
            });
            await this.serviceIndicationRepository.save(serviceIndication);

            serviceItems.push({
                medical_service_id: medicalService.id,
                service_name: medicalService.service_name,
                room_name: medicalService.room?.room_name ?? null,
                queue_number: queueNumber,
                service_price: medicalService.service_price,
            });
        }

        indicationTicket.total_fee = serviceItems.reduce(
            (sum, item) => sum + Number(item.service_price || 0),
            0
        );

        await this.indicationTicketRepository.save(indicationTicket);

        return {
            indication_ticket_id: indicationTicket.id,
            barcode: indicationTicket.barcode,
            indication_type: indicationTicket.indication_type,
            medical_ticket_id: medicalTicket.id,
            patient_id: patient.id,
            patient_name: patient.patient_full_name, 
            doctor_id: doctor.id,
            doctor_name:  doctor.user.full_name,
            diagnosis: indicationTicket.diagnosis,
            indication_date: indicationTicket.indication_date,
            service_items: serviceItems,
            total_fee: indicationTicket.total_fee,
            medical_record_id: medicalRecord.id,
        };
    }

    async getTodayLabIndications() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const indications = await this.indicationTicketRepository.find({
            where: {
                indication_type: IndicationType.TEST,
                indication_date: Between(startOfDay, endOfDay),
            },
            relations: ['patient', 'doctor', 'doctor.user', 'serviceItems', 'serviceItems.medical_service'],
            order: {
                indication_date: 'ASC', // Sắp xếp theo thời gian tạo, cũ nhất lên trước
            },
        });

        return indications.map(indication => ({
            id: indication.id,
            barcode: indication.barcode,
            patient: {
                id: indication.patient.id,
                patient_full_name: indication.patient.patient_full_name,
                patient_dob: indication.patient.patient_dob,
                patient_phone: indication.patient.patient_phone,
                patient_address: indication.patient.patient_address,
                patient_gender: indication.patient.patient_gender,
            },
            doctor: {
                id: indication.doctor.id,
                user: {
                    full_name: indication.doctor.user.full_name,
                },
            },
            diagnosis: indication.diagnosis,
            indication_date: indication.indication_date,
            total_fee: indication.total_fee,
            serviceItems: indication.serviceItems.map(item => ({
                id: item.id,
                medical_service: {
                    id: item.medical_service.id,
                    service_name: item.medical_service.service_name,
                    description: item.medical_service.description,
                    reference_value: item.medical_service.reference_value,
                },
                quantity: item.quantity,
            })),
        }));
    }
}
