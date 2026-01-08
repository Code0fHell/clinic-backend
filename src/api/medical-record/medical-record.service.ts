import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import dayjs from "dayjs";
import { MedicalRecord } from "../../shared/entities/medical-record.entity";
import { Patient } from "../../shared/entities/patient.entity";
import { Visit } from "../../shared/entities/visit.entity";
import { IndicationTicket } from "../../shared/entities/indication-ticket.entity";
import { Prescription } from "../../shared/entities/prescription.entity";
import { ImageResult } from "../../shared/entities/image-result.entity";
import { LabTestResult } from "../../shared/entities/lab-test-result.entity";

@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(Visit)
        private readonly visitRepository: Repository<Visit>,
        @InjectRepository(IndicationTicket)
        private readonly indicationRepository: Repository<IndicationTicket>,
        @InjectRepository(Prescription)
        private readonly prescriptionRepository: Repository<Prescription>,
        @InjectRepository(ImageResult)
        private readonly imageResultRepository: Repository<ImageResult>,
        @InjectRepository(LabTestResult)
        private readonly labTestResultRepository: Repository<LabTestResult>
    ) {}

    async getByPatientId(patientId: string) {
        const patient = await this.patientRepository.findOne({
            where: { id: patientId },
        });
        if (!patient) throw new NotFoundException("Patient not found");

        const record = await this.medicalRecordRepository.findOne({
            where: { patient: { id: patientId } },
            relations: [
                "patient",
                "doctor",
                "doctor.user",
                "visits",
                "prescriptions",
            ],
            order: { created_at: "DESC" },
        });
        if (!record) throw new NotFoundException("Medical record not found");
        return record;
    }

    async getPatientHistory(patientId: string) {
        const patient = await this.patientRepository.findOne({
            where: { id: patientId },
            relations: ["user"],
        });
        if (!patient) {
            throw new NotFoundException("Patient not found");
        }

        const [
            record,
            visits,
            indications,
            prescriptions,
            imageResults,
            labTestResults,
        ] = await Promise.all([
            this.medicalRecordRepository.findOne({
                where: { patient: { id: patientId } },
                relations: ["doctor", "doctor.user"],
                order: { created_at: "DESC" },
            }),
            this.visitRepository.find({
                where: { patient: { id: patientId } },
                relations: [
                    "doctor",
                    "doctor.user",
                    "medicalTickets",
                    "appointment",
                ],
                order: { checked_in_at: "DESC" },
            }),
            this.indicationRepository.find({
                where: { patient: { id: patientId } },
                relations: [
                    "doctor",
                    "doctor.user",
                    "medical_ticket",
                    "serviceItems",
                    "serviceItems.medical_service",
                    "serviceItems.medical_service.room",
                ],
                order: { indication_date: "DESC" },
            }),
            this.prescriptionRepository.find({
                where: { patient: { id: patientId } },
                relations: [
                    "doctor",
                    "doctor.user",
                    "details",
                    "details.medicine",
                ],
                order: { created_at: "DESC" },
            }),
            this.imageResultRepository.find({
                where: { patient: { id: patientId } },
                relations: ["doctor", "doctor.user", "indication"],
                order: { created_at: "DESC" },
            }),
            this.labTestResultRepository.find({
                where: { patient: { id: patientId } },
                relations: [
                    "doctor",
                    "doctor.user",
                    "indication",
                    "indication.doctor",
                    "indication.doctor.user",
                ],
                order: { created_at: "DESC" },
            }),
        ]);

        const latestFollowUpPrescription = prescriptions.find(
            (prescription) => {
                if (!prescription.return_date) return false;
                return dayjs(prescription.return_date)
                    .endOf("day")
                    .isAfter(dayjs());
            }
        );

        const followUpStatus = latestFollowUpPrescription
            ? {
                  status: "FOLLOW_UP",
                  return_date: latestFollowUpPrescription.return_date,
                  prescription_id: latestFollowUpPrescription.id,
              }
            : visits.length <= 1
              ? { status: "FIRST_VISIT" }
              : { status: "REGULAR" };

        return {
            patient,
            medical_record_id: record?.id ?? null,
            follow_up_status: followUpStatus,
            stats: {
                total_visits: visits.length,
                total_prescriptions: prescriptions.length,
                total_indications: indications.length,
                total_lab_tests: labTestResults.length,
            },
            visits,
            indication_tickets: indications,
            prescriptions,
            image_results: imageResults,
            lab_test_results: labTestResults,
        };
    }
}
