import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { IndicationService } from '../src/api/indication/indication.service';
import { IndicationTicket } from '../src/shared/entities/indication-ticket.entity';
import { MedicalService } from '../src/shared/entities/medical-service.entity';
import { ServiceIndication } from '../src/shared/entities/service-indication.entity';
import { MedicalTicket } from '../src/shared/entities/medical-ticket.entity';
import { Patient } from '../src/shared/entities/patient.entity';
import { Staff } from '../src/shared/entities/staff.entity';
import { MedicalRecord } from '../src/shared/entities/medical-record.entity';
import { NotificationService } from '../src/api/notification/notification.service';
import { DoctorType } from '../src/shared/enums/doctor-type.enum';
import { IndicationType } from '../src/shared/enums/indication-ticket-type.enum';
import { ServiceType } from '../src/shared/enums/service-type.enum';

describe('IndicationService', () => {
    let service: IndicationService;
    let indicationTicketRepo: Repository<IndicationTicket>;
    let medicalServiceRepo: Repository<MedicalService>;
    let serviceIndicationRepo: Repository<ServiceIndication>;
    let medicalTicketRepo: Repository<MedicalTicket>;
    let patientRepo: Repository<Patient>;
    let staffRepo: Repository<Staff>;
    let medicalRecordRepo: Repository<MedicalRecord>;
    let notificationService: NotificationService;

    const mockIndicationTicketRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };

    const mockMedicalServiceRepository = {
        findOne: jest.fn(),
    };

    const mockServiceIndicationRepository = {
        create: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
    };

    const mockMedicalTicketRepository = {
        findOne: jest.fn(),
    };

    const mockPatientRepository = {
        findOne: jest.fn(),
    };

    const mockStaffRepository = {
        findOne: jest.fn(),
    };

    const mockMedicalRecordRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockNotificationService = {
        createIndicationNotification: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IndicationService,
                {
                    provide: getRepositoryToken(IndicationTicket),
                    useValue: mockIndicationTicketRepository,
                },
                {
                    provide: getRepositoryToken(MedicalService),
                    useValue: mockMedicalServiceRepository,
                },
                {
                    provide: getRepositoryToken(ServiceIndication),
                    useValue: mockServiceIndicationRepository,
                },
                {
                    provide: getRepositoryToken(MedicalTicket),
                    useValue: mockMedicalTicketRepository,
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
                    provide: getRepositoryToken(MedicalRecord),
                    useValue: mockMedicalRecordRepository,
                },
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        }).compile();

        service = module.get<IndicationService>(IndicationService);
        indicationTicketRepo = module.get<Repository<IndicationTicket>>(
            getRepositoryToken(IndicationTicket)
        );
        medicalServiceRepo = module.get<Repository<MedicalService>>(
            getRepositoryToken(MedicalService)
        );
        serviceIndicationRepo = module.get<Repository<ServiceIndication>>(
            getRepositoryToken(ServiceIndication)
        );
        medicalTicketRepo = module.get<Repository<MedicalTicket>>(
            getRepositoryToken(MedicalTicket)
        );
        patientRepo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
        staffRepo = module.get<Repository<Staff>>(getRepositoryToken(Staff));
        medicalRecordRepo = module.get<Repository<MedicalRecord>>(
            getRepositoryToken(MedicalRecord)
        );
        notificationService = module.get<NotificationService>(NotificationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createIndicationTicket', () => {
        const userId = 'user-1';
        const mockDto = {
            medical_ticket_id: 'ticket-1',
            patient_id: 'patient-1',
            medical_service_ids: ['service-1', 'service-2'],
            diagnosis: 'Test diagnosis',
        };

        const mockDoctor = {
            id: 'doctor-1',
            doctor_type: DoctorType.CLINICAL,
            user: { full_name: 'Dr. Test', id: userId },
        };

        const mockMedicalTicket = {
            id: 'ticket-1',
        };

        const mockPatient = {
            id: 'patient-1',
            patient_full_name: 'Test Patient',
        };

        const mockMedicalService1 = {
            id: 'service-1',
            service_name: 'X-ray',
            service_price: 100000,
            service_type: ServiceType.IMAGING,
            room: { id: 'room-1', room_type: 'DIAGNOSTIC' },
        };

        const mockMedicalService2 = {
            id: 'service-2',
            service_name: 'Blood Test',
            service_price: 50000,
            service_type: ServiceType.TEST,
            room: { id: 'room-2', room_type: 'LAB' },
        };

        const mockIndicationTicket = {
            id: 'indication-1',
            barcode: 'CD-20240101-ABCD',
            total_fee: 150000,
        };

        it('should successfully create indication ticket', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockMedicalTicketRepository.findOne.mockResolvedValue(mockMedicalTicket);
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockMedicalRecordRepository.findOne.mockResolvedValue(null);
            mockMedicalRecordRepository.create.mockReturnValue({
                id: 'record-1',
                patient: mockPatient,
                doctor: mockDoctor,
            });
            mockMedicalRecordRepository.save.mockResolvedValue({
                id: 'record-1',
            });
            mockMedicalServiceRepository.findOne
                .mockResolvedValueOnce(mockMedicalService1)
                .mockResolvedValueOnce(mockMedicalService2);
            mockServiceIndicationRepository.count.mockResolvedValue(0);
            mockServiceIndicationRepository.create.mockReturnValue({
                id: 'service-indication-1',
            });
            mockServiceIndicationRepository.save.mockResolvedValue({
                id: 'service-indication-1',
            });
            mockIndicationTicketRepository.findOne.mockResolvedValue(null);
            mockIndicationTicketRepository.create.mockReturnValue(mockIndicationTicket);
            mockIndicationTicketRepository.save
                .mockResolvedValueOnce({ ...mockIndicationTicket, barcode: null })
                .mockResolvedValueOnce(mockIndicationTicket)
                .mockResolvedValueOnce(mockIndicationTicket);
            mockNotificationService.createIndicationNotification.mockResolvedValue({});

            const result = await service.createIndicationTicket(userId, mockDto);

            expect(result).toHaveProperty('indication_ticket_id');
            expect(result).toHaveProperty('barcode');
            expect(result).toHaveProperty('total_fee', 150000);
            expect(mockIndicationTicketRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when doctor not found', async () => {
            mockStaffRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createIndicationTicket(userId, mockDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when doctor is not clinical', async () => {
            const nonClinicalDoctor = {
                ...mockDoctor,
                doctor_type: DoctorType.DIAGNOSTIC,
            };

            mockStaffRepository.findOne.mockResolvedValue(nonClinicalDoctor);

            await expect(
                service.createIndicationTicket(userId, mockDto)
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException when medical ticket not found', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockMedicalTicketRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createIndicationTicket(userId, mockDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when patient not found', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockMedicalTicketRepository.findOne.mockResolvedValue(mockMedicalTicket);
            mockPatientRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createIndicationTicket(userId, mockDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should create medical record if not exists', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockMedicalTicketRepository.findOne.mockResolvedValue(mockMedicalTicket);
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockMedicalRecordRepository.findOne.mockResolvedValue(null);
            mockMedicalRecordRepository.create.mockReturnValue({
                id: 'record-1',
            });
            mockMedicalRecordRepository.save.mockResolvedValue({
                id: 'record-1',
            });
            mockMedicalServiceRepository.findOne.mockResolvedValue(mockMedicalService1);
            mockServiceIndicationRepository.count.mockResolvedValue(0);
            mockServiceIndicationRepository.create.mockReturnValue({});
            mockServiceIndicationRepository.save.mockResolvedValue({});
            mockIndicationTicketRepository.findOne.mockResolvedValue(null);
            mockIndicationTicketRepository.create.mockReturnValue(mockIndicationTicket);
            mockIndicationTicketRepository.save.mockResolvedValue(mockIndicationTicket);
            mockNotificationService.createIndicationNotification.mockResolvedValue({});

            await service.createIndicationTicket(userId, mockDto);

            expect(mockMedicalRecordRepository.create).toHaveBeenCalled();
            expect(mockMedicalRecordRepository.save).toHaveBeenCalled();
        });

        it('should auto-detect indication type from service types', async () => {
            const dtoWithoutType = {
                ...mockDto,
                indication_type: undefined,
            };

            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockMedicalTicketRepository.findOne.mockResolvedValue(mockMedicalTicket);
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockMedicalRecordRepository.findOne.mockResolvedValue(null);
            mockMedicalRecordRepository.create.mockReturnValue({ id: 'record-1' });
            mockMedicalRecordRepository.save.mockResolvedValue({ id: 'record-1' });
            mockMedicalServiceRepository.findOne
                .mockResolvedValueOnce(mockMedicalService1)
                .mockResolvedValueOnce(mockMedicalService2);
            mockServiceIndicationRepository.count.mockResolvedValue(0);
            mockServiceIndicationRepository.create.mockReturnValue({});
            mockServiceIndicationRepository.save.mockResolvedValue({});
            mockIndicationTicketRepository.findOne.mockResolvedValue(null);
            mockIndicationTicketRepository.create.mockReturnValue(mockIndicationTicket);
            mockIndicationTicketRepository.save.mockResolvedValue(mockIndicationTicket);
            mockNotificationService.createIndicationNotification.mockResolvedValue({});

            const result = await service.createIndicationTicket(userId, dtoWithoutType);

            expect(result).toHaveProperty('indication_type');
        });
    });

    describe('getTodayLabIndications', () => {
        it('should return today lab indications', async () => {
            const mockIndications = [
                {
                    id: 'indication-1',
                    barcode: 'CD-20240101-ABCD',
                    indication_type: IndicationType.TEST,
                    indication_date: new Date(),
                    patient: {
                        id: 'patient-1',
                        patient_full_name: 'Test Patient',
                        patient_dob: new Date(),
                        patient_phone: '0123456789',
                        patient_address: 'Test Address',
                        patient_gender: 'NAM',
                    },
                    doctor: {
                        id: 'doctor-1',
                        user: { full_name: 'Dr. Test' },
                    },
                    diagnosis: 'Test diagnosis',
                    total_fee: 100000,
                    serviceItems: [
                        {
                            id: 'item-1',
                            quantity: 1,
                            medical_service: {
                                id: 'service-1',
                                service_name: 'Blood Test',
                                description: 'Test description',
                                reference_value: 10,
                            },
                        },
                    ],
                },
            ];

            mockIndicationTicketRepository.find.mockResolvedValue(mockIndications);

            const result = await service.getTodayLabIndications();

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('id', 'indication-1');
            expect(result[0]).toHaveProperty('patient');
            expect(result[0]).toHaveProperty('serviceItems');
        });

        it('should return empty array when no indications today', async () => {
            mockIndicationTicketRepository.find.mockResolvedValue([]);

            const result = await service.getTodayLabIndications();

            expect(result).toEqual([]);
        });
    });

    describe('generateUniqueBarcode', () => {
        it('should generate unique barcode', async () => {
            mockIndicationTicketRepository.findOne
                .mockResolvedValueOnce(null) // First attempt succeeds
                .mockResolvedValueOnce({ id: 'exists' }) // Second attempt would fail
                .mockResolvedValueOnce(null); // Third attempt succeeds

            const barcode1 = await service.generateUniqueBarcode();
            const barcode2 = await service.generateUniqueBarcode();

            expect(barcode1).toMatch(/^CD-\d{8}-[A-Z0-9]{4}$/);
            expect(barcode2).toMatch(/^CD-\d{8}-[A-Z0-9]{4}$/);
            expect(barcode1).not.toBe(barcode2);
        });
    });
});






