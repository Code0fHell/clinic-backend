import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { VisitService } from '../src/api/visit/visit.service';
import { Visit } from '../src/shared/entities/visit.entity';
import { Patient } from '../src/shared/entities/patient.entity';
import { Staff } from '../src/shared/entities/staff.entity';
import { Appointment } from '../src/shared/entities/appointment.entity';
import { MedicalRecord } from '../src/shared/entities/medical-record.entity';
import { WorkScheduleDetail } from '../src/shared/entities/work-schedule-detail.entity';
import { AppointmentStatus } from '../src/shared/enums/appointment-status.enum';
import { VisitStatus } from '../src/shared/enums/visit-status.enum';
import { VisitType } from '../src/shared/enums/visit-type.enum';
import dayjs from 'dayjs';

describe('VisitService', () => {
    let service: VisitService;
    let visitRepo: Repository<Visit>;
    let patientRepo: Repository<Patient>;
    let staffRepo: Repository<Staff>;
    let appointmentRepo: Repository<Appointment>;
    let medicalRecordRepo: Repository<MedicalRecord>;
    let workScheduleDetailRepo: Repository<WorkScheduleDetail>;

    const mockVisitRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockPatientRepository = {
        findOne: jest.fn(),
    };

    const mockStaffRepository = {
        findOne: jest.fn(),
    };

    const mockAppointmentRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockMedicalRecordRepository = {
        findOne: jest.fn(),
    };

    const mockWorkScheduleDetailRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VisitService,
                {
                    provide: getRepositoryToken(Visit),
                    useValue: mockVisitRepository,
                },
                {
                    provide: getRepositoryToken(Patient),
                    useValue: mockPatientRepository,
                },
                {
                    provide: getRepositoryToken(Staff),
                    useValue: mockStaffRepository,
                },
                {
                    provide: getRepositoryToken(Appointment),
                    useValue: mockAppointmentRepository,
                },
                {
                    provide: getRepositoryToken(MedicalRecord),
                    useValue: mockMedicalRecordRepository,
                },
                {
                    provide: getRepositoryToken(WorkScheduleDetail),
                    useValue: mockWorkScheduleDetailRepository,
                },
            ],
        }).compile();

        service = module.get<VisitService>(VisitService);
        visitRepo = module.get<Repository<Visit>>(getRepositoryToken(Visit));
        patientRepo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
        staffRepo = module.get<Repository<Staff>>(getRepositoryToken(Staff));
        appointmentRepo = module.get<Repository<Appointment>>(
            getRepositoryToken(Appointment)
        );
        medicalRecordRepo = module.get<Repository<MedicalRecord>>(
            getRepositoryToken(MedicalRecord)
        );
        workScheduleDetailRepo = module.get<Repository<WorkScheduleDetail>>(
            getRepositoryToken(WorkScheduleDetail)
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const mockPatient = {
            id: 'patient-1',
            patient_full_name: 'Test Patient',
        };

        const mockDoctor = {
            id: 'doctor-1',
            user: { full_name: 'Dr. Test' },
        };

        const mockAppointment = {
            id: 'appointment-1',
            doctor: mockDoctor,
            status: AppointmentStatus.PENDING,
        };

        const mockSlot = {
            id: 'slot-1',
            is_booked: false,
            schedule: {
                id: 'schedule-1',
                staff: { id: 'doctor-1' },
            },
        };

        const mockVisit = {
            id: 'visit-1',
            patient: mockPatient,
            doctor: mockDoctor,
            visit_type: VisitType.APPOINTMENT,
            visit_status: VisitStatus.CHECKED_IN,
            queue_number: 1,
        };

        it('should create visit with appointment', async () => {
            const dto = {
                patient_id: 'patient-1',
                appointment_id: 'appointment-1',
                visit_type: VisitType.APPOINTMENT,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
            mockAppointmentRepository.save.mockResolvedValue({
                ...mockAppointment,
                status: AppointmentStatus.CHECKED_IN,
            });
            mockVisitRepository.findOne.mockResolvedValue(null);
            mockVisitRepository.create.mockReturnValue(mockVisit);
            mockVisitRepository.save.mockResolvedValue(mockVisit);

            const result = await service.create(dto);

            expect(result).toEqual(mockVisit);
            expect(mockAppointmentRepository.save).toHaveBeenCalledWith({
                ...mockAppointment,
                status: AppointmentStatus.CHECKED_IN,
            });
            expect(mockVisitRepository.save).toHaveBeenCalled();
        });

        it('should create visit without appointment (walk-in)', async () => {
            const dto = {
                patient_id: 'patient-1',
                doctor_id: 'doctor-1',
                work_schedule_detail_id: 'slot-1',
                visit_type: VisitType.WALK_IN,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue(mockSlot);
            mockWorkScheduleDetailRepository.save.mockResolvedValue({
                ...mockSlot,
                is_booked: true,
            });
            mockVisitRepository.findOne.mockResolvedValue(null);
            mockVisitRepository.create.mockReturnValue(mockVisit);
            mockVisitRepository.save.mockResolvedValue(mockVisit);

            const result = await service.create(dto);

            expect(result).toEqual(mockVisit);
            expect(mockWorkScheduleDetailRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when patient not found', async () => {
            const dto = {
                patient_id: 'patient-1',
                appointment_id: 'appointment-1',
                visit_type: VisitType.APPOINTMENT,
            };

            mockPatientRepository.findOne.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when appointment not found', async () => {
            const dto = {
                patient_id: 'patient-1',
                appointment_id: 'appointment-1',
                visit_type: VisitType.APPOINTMENT,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockAppointmentRepository.findOne.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when walk-in without doctor and slot', async () => {
            const dto = {
                patient_id: 'patient-1',
                visit_type: VisitType.WALK_IN,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);

            await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when doctor not found for walk-in', async () => {
            const dto = {
                patient_id: 'patient-1',
                doctor_id: 'doctor-1',
                work_schedule_detail_id: 'slot-1',
                visit_type: VisitType.WALK_IN,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockStaffRepository.findOne.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when slot is already booked', async () => {
            const dto = {
                patient_id: 'patient-1',
                doctor_id: 'doctor-1',
                work_schedule_detail_id: 'slot-1',
                visit_type: VisitType.WALK_IN,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        });

        it('should create visit with medical record', async () => {
            const dto = {
                patient_id: 'patient-1',
                appointment_id: 'appointment-1',
                visit_type: VisitType.APPOINTMENT,
                medical_record_id: 'record-1',
            };

            const mockMedicalRecord = {
                id: 'record-1',
                patient: mockPatient,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
            mockAppointmentRepository.save.mockResolvedValue({
                ...mockAppointment,
                status: AppointmentStatus.CHECKED_IN,
            });
            mockMedicalRecordRepository.findOne.mockResolvedValue(mockMedicalRecord);
            mockVisitRepository.findOne.mockResolvedValue(null);
            mockVisitRepository.create.mockReturnValue(mockVisit);
            mockVisitRepository.save.mockResolvedValue(mockVisit);

            const result = await service.create(dto);

            expect(result).toEqual(mockVisit);
        });

        it('should throw NotFoundException when medical record not found', async () => {
            const dto = {
                patient_id: 'patient-1',
                appointment_id: 'appointment-1',
                visit_type: VisitType.APPOINTMENT,
                medical_record_id: 'record-1',
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
            mockAppointmentRepository.save.mockResolvedValue({
                ...mockAppointment,
                status: AppointmentStatus.CHECKED_IN,
            });
            mockMedicalRecordRepository.findOne.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });

        it('should assign correct queue number', async () => {
            const dto = {
                patient_id: 'patient-1',
                appointment_id: 'appointment-1',
                visit_type: VisitType.APPOINTMENT,
            };

            const existingVisit = {
                id: 'visit-existing',
                queue_number: 5,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
            mockAppointmentRepository.save.mockResolvedValue({
                ...mockAppointment,
                status: AppointmentStatus.CHECKED_IN,
            });
            mockVisitRepository.findOne.mockResolvedValue(existingVisit);
            mockVisitRepository.create.mockReturnValue({
                ...mockVisit,
                queue_number: 6,
            });
            mockVisitRepository.save.mockResolvedValue({
                ...mockVisit,
                queue_number: 6,
            });

            const result = await service.create(dto);

            expect(result.queue_number).toBe(6);
        });
    });

    describe('getTodayQueue', () => {
        it('should return today queue', async () => {
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                addOrderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            };

            mockVisitRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.getTodayQueue();

            expect(result).toEqual([]);
            expect(mockQueryBuilder.getMany).toHaveBeenCalled();
        });
    });

    describe('updateVisitStatus', () => {
        it('should successfully update visit status', async () => {
            const visitId = 'visit-1';
            const newStatus = VisitStatus.COMPLETED;
            const mockVisit = {
                id: visitId,
                visit_status: VisitStatus.CHECKED_IN,
                patient: { id: 'patient-1' },
                doctor: { id: 'doctor-1' },
            };

            mockVisitRepository.findOne.mockResolvedValue(mockVisit);
            mockVisitRepository.save.mockResolvedValue({
                ...mockVisit,
                visit_status: newStatus,
            });

            const result = await service.updateVisitStatus(visitId, newStatus);

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('status', newStatus);
            expect(mockVisitRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when visit not found', async () => {
            const visitId = 'visit-1';
            const newStatus = VisitStatus.COMPLETED;

            mockVisitRepository.findOne.mockResolvedValue(null);

            await expect(
                service.updateVisitStatus(visitId, newStatus)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findOneWithTicket', () => {
        it('should return visit with ticket information', async () => {
            const visitId = 'visit-1';
            const mockUser = { full_name: 'Test User' };
            const mockVisit = {
                id: visitId,
                patient: { id: 'patient-1', patient_full_name: 'Test Patient' },
                doctor: { id: 'doctor-1', user: { full_name: 'Dr. Test' } },
                medicalTickets: [
                    { id: 'ticket-1', clinical_fee: 150000 },
                ],
            };

            mockVisitRepository.findOne.mockResolvedValue(mockVisit);

            const result = await service.findOneWithTicket(visitId, mockUser);

            expect(result).toHaveProperty('created_by', 'Test User');
            expect(result).toHaveProperty('patient');
            expect(result).toHaveProperty('doctor');
        });

        it('should throw NotFoundException when visit not found', async () => {
            const visitId = 'visit-1';
            const mockUser = { full_name: 'Test User' };

            mockVisitRepository.findOne.mockResolvedValue(null);

            await expect(
                service.findOneWithTicket(visitId, mockUser)
            ).rejects.toThrow(NotFoundException);
        });
    });
});






