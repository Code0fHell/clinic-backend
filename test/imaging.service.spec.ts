import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { ImagingService } from '../src/api/imaging/imaging.service';
import { ImageResult } from '../src/shared/entities/image-result.entity';
import { IndicationTicket } from '../src/shared/entities/indication-ticket.entity';
import { Staff } from '../src/shared/entities/staff.entity';
import { Patient } from '../src/shared/entities/patient.entity';
import { ServiceIndication } from '../src/shared/entities/service-indication.entity';
import { DoctorType } from '../src/shared/enums/doctor-type.enum';

describe('ImagingService', () => {
    let service: ImagingService;
    let imageResultRepo: Repository<ImageResult>;
    let indicationTicketRepo: Repository<IndicationTicket>;
    let staffRepo: Repository<Staff>;
    let patientRepo: Repository<Patient>;
    let serviceIndicationRepo: Repository<ServiceIndication>;

    const mockImageResultRepository = {
        create: jest.fn(),
        save: jest.fn(),
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
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImagingService,
                {
                    provide: getRepositoryToken(ImageResult),
                    useValue: mockImageResultRepository,
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

        service = module.get<ImagingService>(ImagingService);
        imageResultRepo = module.get<Repository<ImageResult>>(
            getRepositoryToken(ImageResult)
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

    describe('createXrayResult', () => {
        const userId = 'user-1';
        const mockDto = {
            indication_id: 'indication-1',
            result: 'Test result',
            conclusion: 'Test conclusion',
        };

        const mockFiles = [
            {
                filename: 'image1.jpg',
                originalname: 'xray1.jpg',
            },
            {
                filename: 'image2.jpg',
                originalname: 'xray2.jpg',
            },
        ] as Express.Multer.File[];

        const mockDiagnosticDoctor = {
            id: 'doctor-1',
            doctor_type: DoctorType.DIAGNOSTIC,
            user: { id: userId, full_name: 'Dr. Diagnostic' },
        };

        const mockIndication = {
            id: 'indication-1',
            patient: { id: 'patient-1' },
            doctor: { id: 'doctor-1' },
        };

        const mockImageResult = {
            id: 'result-1',
            image_url: '/uploads/xray/image1.jpg',
            barcode: 'XRAY-1234567890-abc123-indicat',
        };

        it('should successfully create X-ray result', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDiagnosticDoctor);
            mockIndicationTicketRepository.findOne.mockResolvedValue(mockIndication);
            mockImageResultRepository.create.mockReturnValue(mockImageResult);
            mockImageResultRepository.save.mockResolvedValue(mockImageResult);

            const result = await service.createXrayResult(userId, mockDto, mockFiles);

            expect(result).toHaveProperty('message', 'X-ray results uploaded successfully');
            expect(result).toHaveProperty('count', 2);
            expect(result).toHaveProperty('image_urls');
            expect(mockImageResultRepository.save).toHaveBeenCalledTimes(2);
        });

        it('should throw ForbiddenException when doctor is not diagnostic', async () => {
            const clinicalDoctor = {
                ...mockDiagnosticDoctor,
                doctor_type: DoctorType.CLINICAL,
            };

            mockStaffRepository.findOne.mockResolvedValue(clinicalDoctor);

            await expect(
                service.createXrayResult(userId, mockDto, mockFiles)
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException when no files provided', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDiagnosticDoctor);

            await expect(
                service.createXrayResult(userId, mockDto, [])
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when indication not found', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDiagnosticDoctor);
            mockIndicationTicketRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createXrayResult(userId, mockDto, mockFiles)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getResultsByPatient', () => {
        it('should return results for patient', async () => {
            const patientId = 'patient-1';
            const mockResults = [
                {
                    id: 'result-1',
                    image_url: '/uploads/xray/image1.jpg',
                },
            ];

            mockImageResultRepository.find.mockResolvedValue(mockResults);

            const result = await service.getResultsByPatient(patientId);

            expect(result).toEqual(mockResults);
            expect(mockImageResultRepository.find).toHaveBeenCalledWith({
                where: { patient: { id: patientId } },
                relations: ['indication', 'doctor'],
                order: { created_at: 'DESC' },
            });
        });
    });

    describe('getResultsByIndication', () => {
        it('should return results for indication', async () => {
            const indicationId = 'indication-1';
            const mockResults = [
                {
                    id: 'result-1',
                    image_url: '/uploads/xray/image1.jpg',
                },
            ];

            mockImageResultRepository.find.mockResolvedValue(mockResults);

            const result = await service.getResultsByIndication(indicationId);

            expect(result).toEqual(mockResults);
            expect(mockImageResultRepository.find).toHaveBeenCalledWith({
                where: { indication: { id: indicationId } },
                relations: ['patient', 'doctor'],
                order: { created_at: 'DESC' },
            });
        });
    });

    describe('getIndicationsForDiagnosticDoctor', () => {
        it('should return indications for diagnostic doctor', async () => {
            const userId = 'user-1';
            const mockDoctor = {
                id: 'doctor-1',
                doctor_type: DoctorType.DIAGNOSTIC,
                user: { id: userId },
            };

            const mockIndications = [
                {
                    id: 'indication-1',
                    barcode: 'CD-20240101-ABCD',
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
                    indication_date: new Date(),
                    total_fee: 100000,
                    serviceItems: [
                        {
                            id: 'item-1',
                            quantity: 1,
                            medical_service: {
                                id: 'service-1',
                                service_name: 'X-ray',
                                description: 'Test description',
                            },
                        },
                    ],
                },
            ];

            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockIndicationTicketRepository.find.mockResolvedValue(mockIndications);

            const result = await service.getIndicationsForDiagnosticDoctor(userId);

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('id', 'indication-1');
            expect(result[0]).toHaveProperty('patient');
            expect(result[0]).toHaveProperty('serviceItems');
        });

        it('should throw ForbiddenException when doctor is not diagnostic', async () => {
            const userId = 'user-1';
            const clinicalDoctor = {
                id: 'doctor-1',
                doctor_type: DoctorType.CLINICAL,
                user: { id: userId },
            };

            mockStaffRepository.findOne.mockResolvedValue(clinicalDoctor);

            await expect(
                service.getIndicationsForDiagnosticDoctor(userId)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('getIndicationDetail', () => {
        it('should return indication detail', async () => {
            const userId = 'user-1';
            const indicationId = 'indication-1';
            const mockDoctor = {
                id: 'doctor-1',
                doctor_type: DoctorType.DIAGNOSTIC,
                user: { id: userId },
            };

            const mockIndication = {
                id: indicationId,
                barcode: 'CD-20240101-ABCD',
                diagnosis: 'Test diagnosis',
                indication_date: new Date(),
                total_fee: 100000,
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
                serviceItems: [
                    {
                        id: 'item-1',
                        quantity: 1,
                        medical_service: {
                            id: 'service-1',
                            service_name: 'X-ray',
                            description: 'Test description',
                        },
                    },
                ],
            };

            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockIndicationTicketRepository.findOne.mockResolvedValue(mockIndication);

            const result = await service.getIndicationDetail(userId, indicationId);

            expect(result).toHaveProperty('id', indicationId);
            expect(result).toHaveProperty('patient');
            expect(result).toHaveProperty('serviceItems');
        });

        it('should throw NotFoundException when indication not found', async () => {
            const userId = 'user-1';
            const indicationId = 'indication-1';
            const mockDoctor = {
                id: 'doctor-1',
                doctor_type: DoctorType.DIAGNOSTIC,
                user: { id: userId },
            };

            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockIndicationTicketRepository.findOne.mockResolvedValue(null);

            await expect(
                service.getIndicationDetail(userId, indicationId)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getCompletedResultsForDiagnosticDoctor', () => {
        it('should return completed results grouped by indication', async () => {
            const userId = 'user-1';
            const mockDoctor = {
                id: 'doctor-1',
                doctor_type: DoctorType.DIAGNOSTIC,
                user: { id: userId },
            };

            const mockResults = [
                {
                    id: 'result-1',
                    indication: {
                        id: 'indication-1',
                        barcode: 'CD-20240101-ABCD',
                        diagnosis: 'Test diagnosis',
                        indication_date: new Date(),
                        serviceItems: [
                            {
                                medical_service: {
                                    service_name: 'X-ray',
                                },
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
                    image_url: '/uploads/xray/image1.jpg',
                    result: 'Test result',
                    conclusion: 'Test conclusion',
                    created_at: new Date(),
                    barcode: 'XRAY-1234567890-abc123',
                },
            ];

            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockImageResultRepository.find.mockResolvedValue(mockResults);

            const result = await service.getCompletedResultsForDiagnosticDoctor(userId);

            expect(result).toBeInstanceOf(Array);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty('indication');
                expect(result[0]).toHaveProperty('images');
            }
        });
    });
});






