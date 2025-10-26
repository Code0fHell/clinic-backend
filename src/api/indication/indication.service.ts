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
import { Repository } from "typeorm";
import { CreateIndicationTicketDto } from "./dto/create-indication-ticket.dto";
import { DoctorType } from "src/shared/enums/doctor-type.enum";

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
        private readonly staffRepository: Repository<Staff>
    ) {}

    async createIndicationTicket(userId: string, dto: CreateIndicationTicketDto) {
        // Tìm bác sĩ theo user_id
        const doctor = await this.staffRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        if (!doctor) throw new NotFoundException('Doctor not found');
        if (doctor.doctor_type !== DoctorType.CLINICAL)
            throw new ForbiddenException('Only clinical doctors can create indication tickets');

        const medicalTicket = await this.medicalTicketRepository.findOne({
            where: { id: dto.medical_ticket_id },
        });
        console.log('medicalTicket: ', medicalTicket);
        const patient = await this.patientRepository.findOne({
            where: { id: dto.patient_id },
        });
        console.log('patient: ', patient);
        if (!medicalTicket || !patient)
            throw new NotFoundException("Medical ticket or patient not found");

        const indicationTicket = this.indicationTicketRepository.create({
            medical_ticket: medicalTicket,
            doctor: doctor,
            patient: patient,
            diagnosis: dto.diagnosis,
            indication_date: new Date(),
            total_fee: 0,
        });
        await this.indicationTicketRepository.save(indicationTicket);

        const dateStr = indicationTicket.indication_date.toISOString().replace(/[:.]/g, '-');
        indicationTicket.barcode = `CD-${dateStr}-${indicationTicket.id}`;
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

            const queueNumber =
                (await this.serviceIndicationRepository.count({
                    where: {
                        medical_service: { id: serviceId },
                    },
                })) + 1;

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
            medical_ticket_id: medicalTicket.id,
            patient_id: patient.id,
            doctor_id: doctor.id,
            diagnosis: indicationTicket.diagnosis,
            indication_date: indicationTicket.indication_date,
            service_items: serviceItems,
            total_fee: indicationTicket.total_fee,
        };
    }

}
