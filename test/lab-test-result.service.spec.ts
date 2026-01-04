import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { LabTestResultService } from '../src/api/lab-test-result/lab-test-result.service';
import { LabTestResult } from '../src/shared/entities/lab-test-result.entity';
import { IndicationTicket } from '../src/shared/entities/indication-ticket.entity';
import { Staff } from '../src/shared/entities/staff.entity';
import { Patient } from '../src/shared/entities/patient.entity';
import { ServiceIndication } from '../src/shared/entities/service-indication.entity';
import { DoctorType } from '../src/shared/enums/doctor-type.enum';

describe('LabTestResultService', () => {
    let service: LabTestResultService;
    let labTestResultRepo: Repository<LabTestResult>;
    let indicationTicketRepo: Repository<IndicationTicket>;
    let staffRepo: Repository<Staff>;
    let patientRepo: Repository<Patient>;
    let serviceIndicationRepo: Repository<ServiceIndication>;

    const mockLabTestResultRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
    };

    const mockIndicationTicketRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
    };

    const mockStaffRepository = {
        findOne: jest.fn(),
    };

    const mockPatientRepository = {
        findOne: jest.fn(),
    };

    const mockServiceIndicationRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LabTestResultService,
                {
                    provide: getRepositoryToken(LabTestResult),
                    useValue: mockLabTestResultRepository,
                },
                {
                    provide: getRepositoryToken(IndicationTicket),
                    useValue: mockIndicationTicketRepository,
                },
                {
                    provide: getRepositoryToken(Staff),
                    useValue: mockStaffRepository,
                },
                {
                    provide: getRepositoryToken(Patient),
                    useValue: mockPatientRepository,
                },
                {
                    provide: getRepositoryToken(ServiceIndication),
                    useValue: mockServiceIndicationRepository,
                },
            ],
        }).compile();

        service = module.get<LabTestResultService>(LabTestResultService);
        labTestResultRepo = module.get<Repository<LabTestResult>>(
            getRepositoryToken(LabTestResult)
        );
        indicationTicketRepo = module.get<Repository<IndicationTicket>>(
            getRepositoryToken(IndicationTicket)
        );
        staffRepo = module.get<Repository<Staff>>(getRepositoryToken(Staff));
        patientRepo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
        serviceIndicationRepo = module.get<Repository<ServiceIndication>>(
            getRepositoryToken(ServiceIndication)
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createLabTestResult', () => {
        const userId = 'user-1';
        const mockDto = {
            indication_id: 'indication-1',
            patient_id: 'patient-1',
            service_results: [
                {
                    service_indication_id: 'service-indication-1',
                    test_result: 8.5,
                },
            ],
            conclusion: 'Test conclusion',
        };

        const mockLabStaff = {
            id: 'lab-staff-1',
            doctor_type: DoctorType.LAB,
            user: { id: userId, full_name: 'Lab Staff' },
        };

        const mockIndication = {
            id: 'indication-1',
            patient: { id: 'patient-1' },
            doctor: { id: 'doctor-1' },
            serviceItems: [
                {
                    id: 'service-indication-1',
                    medical_service: {
                        id: 'service-1',
                        service_name: 'Blood Test',
                        reference_value: 10,
                    },
                },
            ],
        };

        const mockPatient = {
            id: 'patient-1',
            patient_full_name: 'Test Patient',
        };

        const mockServiceIndication = {
            id: 'service-indication-1',
            indication: { id: 'indication-1' },
            medical_service: {
                id: 'service-1',
                service_name: 'Blood Test',
                reference_value: 10,
            },
            test_result: null,
        };

        const mockLabTestResult = {
            id: 'result-1',
            barcode: 'LAB-20240101-ABCD',
            result: 'Blood Test: 8.5 (Tham chiếu: 10)',
            conclusion: 'Test conclusion',
        };

        it('should successfully create lab test result', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockLabStaff);
            mockIndicationTicketRepository.findOne.mockResolvedValue(mockIndication);
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockServiceIndicationRepository.findOne.mockResolvedValue(
                mockServiceIndication
            );
            mockServiceIndicationRepository.save.mockResolvedValue({
                ...mockServiceIndication,
                test_result: 8.5,
            });
            mockLabTestResultRepository.findOne.mockResolvedValue(null);
            mockLabTestResultRepository.create.mockReturnValue(mockLabTestResult);
            mockLabTestResultRepository.save.mockResolvedValue(mockLabTestResult);

            const result = await service.createLabTestResult(userId, mockDto);

            expect(result).toHaveProperty('message', 'Lab test result created successfully');
            expect(result).toHaveProperty('labTestResultId');
            expect(result).toHaveProperty('barcode');
            expect(mockServiceIndicationRepository.save).toHaveBeenCalled();
            expect(mockLabTestResultRepository.save).toHaveBeenCalled();
        });

        it('should throw ForbiddenException when staff is not lab type', async () => {
            const clinicalDoctor = {
                ...mockLabStaff,
                doctor_type: DoctorType.CLINICAL,
            };

            mockStaffRepository.findOne.mockResolvedValue(clinicalDoctor);

            await expect(
                service.createLabTestResult(userId, mockDto)
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException when indication not found', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockLabStaff);
            mockIndicationTicketRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createLabTestResult(userId, mockDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when patient not found', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockLabStaff);
            mockIndicationTicketRepository.findOne.mockResolvedValue(mockIndication);
            mockPatientRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createLabTestResult(userId, mockDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when service_results is empty', async () => {
            const dtoWithoutResults = {
                ...mockDto,
                service_results: [],
            };

            mockStaffRepository.findOne.mockResolvedValue(mockLabStaff);
            mockIndicationTicketRepository.findOne.mockResolvedValue(mockIndication);
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);

            await expect(
                service.createLabTestResult(userId, dtoWithoutResults)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when service indication not found', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockLabStaff);
            mockIndicationTicketRepository.findOne.mockResolvedValue(mockIndication);
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockServiceIndicationRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createLabTestResult(userId, mockDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when service indication does not belong to indication', async () => {
            const wrongServiceIndication = {
                ...mockServiceIndication,
                indication: { id: 'indication-2' },
            };

            mockStaffRepository.findOne.mockResolvedValue(mockLabStaff);
            mockIndicationTicketRepository.findOne.mockResolvedValue(mockIndication);
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockServiceIndicationRepository.findOne.mockResolvedValue(
                wrongServiceIndication
            );

            await expect(
                service.createLabTestResult(userId, mockDto)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('getResultsByPatient', () => {
        it('should return results for patient', async () => {
            const patientId = 'patient-1';
            const mockResults = [
                {
                    id: 'result-1',
                    barcode: 'LAB-20240101-ABCD',
                },
            ];

            mockPatientRepository.findOne.mockResolvedValue({ id: patientId });
            mockLabTestResultRepository.find.mockResolvedValue(mockResults);

            const result = await service.getResultsByPatient(patientId);

            expect(result).toEqual(mockResults);
            expect(mockLabTestResultRepository.find).toHaveBeenCalledWith({
                where: { patient: { id: patientId } },
                relations: ['indication', 'doctor', 'doctor.user'],
                order: { created_at: 'DESC' },
            });
        });

        it('should throw NotFoundException when patient not found', async () => {
            const patientId = 'patient-1';

            mockPatientRepository.findOne.mockResolvedValue(null);

            await expect(
                service.getResultsByPatient(patientId)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getResultsByIndication', () => {
        it('should return results for indication', async () => {
            const indicationId = 'indication-1';
            const mockResults = [
                {
                    id: 'result-1',
                    barcode: 'LAB-20240101-ABCD',
                },
            ];

            mockIndicationTicketRepository.findOne.mockResolvedValue({
                id: indicationId,
            });
            mockLabTestResultRepository.find.mockResolvedValue(mockResults);

            const result = await service.getResultsByIndication(indicationId);

            expect(result).toEqual(mockResults);
            expect(mockLabTestResultRepository.find).toHaveBeenCalledWith({
                where: { indication: { id: indicationId } },
                relations: ['patient', 'doctor', 'doctor.user'],
                order: { created_at: 'DESC' },
            });
        });

        it('should throw NotFoundException when indication not found', async () => {
            const indicationId = 'indication-1';

            mockIndicationTicketRepository.findOne.mockResolvedValue(null);

            await expect(
                service.getResultsByIndication(indicationId)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTodayCompletedResults', () => {
        it('should return today completed results', async () => {
            const mockResults = [
                {
                    id: 'result-1',
                    barcode: 'LAB-20240101-ABCD',
                    indication: {
                        id: 'indication-1',
                        barcode: 'CD-20240101-ABCD',
                        diagnosis: 'Test diagnosis',
                        indication_date: new Date(),
                        serviceItems: [
                            {
                                medical_service: {
                                    service_name: 'Blood Test',
                                    reference_value: 10,
                                },
                                test_result: 8.5,
                            },
                        ],
                    },
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
                    conclusion: 'Test conclusion',
                    created_at: new Date(),
                },
            ];

            mockLabTestResultRepository.find.mockResolvedValue(mockResults);

            const result = await service.getTodayCompletedResults();

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('id', 'result-1');
            expect(result[0]).toHaveProperty('patient');
            expect(result[0]).toHaveProperty('testResults');
        });
    });

    describe('generateUniqueBarcode', () => {
        it('should generate unique barcode', async () => {
            mockLabTestResultRepository.findOne
                .mockResolvedValueOnce(null) // First attempt succeeds
                .mockResolvedValueOnce({ id: 'exists' }) // Second attempt would fail
                .mockResolvedValueOnce(null); // Third attempt succeeds

            const barcode1 = await service.generateUniqueBarcode();
            const barcode2 = await service.generateUniqueBarcode();

            expect(barcode1).toMatch(/^LAB-\d{8}-[A-Z0-9]{4}$/);
            expect(barcode2).toMatch(/^LAB-\d{8}-[A-Z0-9]{4}$/);
            expect(barcode1).not.toBe(barcode2);
        });
    });
});






