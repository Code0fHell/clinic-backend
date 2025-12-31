import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrescriptionService } from '../src/api/prescription/prescription.service';
import { Prescription } from '../src/shared/entities/prescription.entity';
import { Patient } from '../src/shared/entities/patient.entity';
import { Staff } from '../src/shared/entities/staff.entity';
import { MedicalRecord } from '../src/shared/entities/medical-record.entity';
import { Medicine } from '../src/shared/entities/medicine.entity';
import { PrescriptionDetail } from '../src/shared/entities/prescription-detail.entity';
import { NotificationService } from '../src/api/notification/notification.service';
import { PrescriptionStatus } from '../src/shared/enums/prescription-status.enum';

describe('PrescriptionService', () => {
    let service: PrescriptionService;
    let prescriptionRepo: Repository<Prescription>;
    let patientRepo: Repository<Patient>;
    let staffRepo: Repository<Staff>;
    let medicalRecordRepo: Repository<MedicalRecord>;
    let medicineRepo: Repository<Medicine>;
    let detailRepo: Repository<PrescriptionDetail>;
    let notificationService: NotificationService;

    const mockPrescriptionRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
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

    const mockMedicineRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockDetailRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockNotificationService = {
        createPrescriptionNotification: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PrescriptionService,
                {
                    provide: getRepositoryToken(Prescription),
                    useValue: mockPrescriptionRepository,
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
                    provide: getRepositoryToken(Medicine),
                    useValue: mockMedicineRepository,
                },
                {
                    provide: getRepositoryToken(PrescriptionDetail),
                    useValue: mockDetailRepository,
                },
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        }).compile();

        service = module.get<PrescriptionService>(PrescriptionService);
        prescriptionRepo = module.get<Repository<Prescription>>(
            getRepositoryToken(Prescription)
        );
        patientRepo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
        staffRepo = module.get<Repository<Staff>>(getRepositoryToken(Staff));
        medicalRecordRepo = module.get<Repository<MedicalRecord>>(
            getRepositoryToken(MedicalRecord)
        );
        medicineRepo = module.get<Repository<Medicine>>(getRepositoryToken(Medicine));
        detailRepo = module.get<Repository<PrescriptionDetail>>(
            getRepositoryToken(PrescriptionDetail)
        );
        notificationService = module.get<NotificationService>(NotificationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const mockDto = {
            patient_id: 'patient-1',
            doctor_id: 'doctor-1',
            conclusion: 'Test conclusion',
            medicine_items: [
                {
                    medicine_id: 'medicine-1',
                    quantity: 2,
                    dosage: '1 viên/lần, 2 lần/ngày',
                },
            ],
        };

        const mockPatient = {
            id: 'patient-1',
            patient_full_name: 'Test Patient',
        };

        const mockDoctor = {
            id: 'doctor-1',
            user: { full_name: 'Dr. Test' },
        };

        const mockMedicine = {
            id: 'medicine-1',
            name: 'Paracetamol',
            price: 50000,
            stock: 100,
        };

        const mockPrescription = {
            id: 'prescription-1',
            patient: mockPatient,
            doctor: mockDoctor,
            conclusion: 'Test conclusion',
            total_fee: 100000,
            status: PrescriptionStatus.PENDING,
        };

        it('should successfully create prescription', async () => {
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockMedicalRecordRepository.findOne.mockResolvedValue(null);
            mockMedicalRecordRepository.create.mockReturnValue({
                id: 'record-1',
            });
            mockMedicalRecordRepository.save.mockResolvedValue({
                id: 'record-1',
            });
            mockPrescriptionRepository.create.mockReturnValue(mockPrescription);
            mockPrescriptionRepository.save.mockResolvedValue(mockPrescription);
            mockMedicineRepository.findOne.mockResolvedValue(mockMedicine);
            mockDetailRepository.create.mockReturnValue({
                id: 'detail-1',
            });
            mockDetailRepository.save.mockResolvedValue({
                id: 'detail-1',
            });
            mockPrescriptionRepository.findOne.mockResolvedValue({
                ...mockPrescription,
                patient: { ...mockPatient, user: { full_name: 'Test Patient' } },
                doctor: { ...mockDoctor, user: { full_name: 'Dr. Test' } },
                medical_record: { id: 'record-1' },
                details: [
                    {
                        id: 'detail-1',
                        medicine: mockMedicine,
                        quantity: 2,
                    },
                ],
            });
            mockNotificationService.createPrescriptionNotification.mockResolvedValue({});

            const result = await service.create(mockDto);

            expect(result).toHaveProperty('message', 'Tạo đơn thuốc thành công');
            expect(result).toHaveProperty('prescription_id');
            expect(mockPrescriptionRepository.save).toHaveBeenCalled();
            expect(mockDetailRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when patient not found', async () => {
            mockPatientRepository.findOne.mockResolvedValue(null);

            await expect(service.create(mockDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when doctor not found', async () => {
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockStaffRepository.findOne.mockResolvedValue(null);

            await expect(service.create(mockDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when medicine not found', async () => {
            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockMedicalRecordRepository.findOne.mockResolvedValue(null);
            mockMedicalRecordRepository.create.mockReturnValue({ id: 'record-1' });
            mockMedicalRecordRepository.save.mockResolvedValue({ id: 'record-1' });
            mockPrescriptionRepository.create.mockReturnValue(mockPrescription);
            mockPrescriptionRepository.save.mockResolvedValue(mockPrescription);
            mockMedicineRepository.findOne.mockResolvedValue(null);

            await expect(service.create(mockDto)).rejects.toThrow(NotFoundException);
        });

        it('should use existing medical record if provided', async () => {
            const dtoWithRecord = {
                ...mockDto,
                medical_record_id: 'record-1',
            };

            const mockMedicalRecord = {
                id: 'record-1',
                patient: mockPatient,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockMedicalRecordRepository.findOne.mockResolvedValue(mockMedicalRecord);
            mockPrescriptionRepository.create.mockReturnValue(mockPrescription);
            mockPrescriptionRepository.save.mockResolvedValue(mockPrescription);
            mockMedicineRepository.findOne.mockResolvedValue(mockMedicine);
            mockDetailRepository.create.mockReturnValue({ id: 'detail-1' });
            mockDetailRepository.save.mockResolvedValue({ id: 'detail-1' });
            mockPrescriptionRepository.findOne.mockResolvedValue({
                ...mockPrescription,
                medical_record: mockMedicalRecord,
                details: [],
            });
            mockNotificationService.createPrescriptionNotification.mockResolvedValue({});

            await service.create(dtoWithRecord);

            expect(mockMedicalRecordRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all prescriptions', async () => {
            const mockPrescriptions = [
                {
                    id: 'prescription-1',
                    patient: { id: 'patient-1' },
                    doctor: { id: 'doctor-1' },
                },
            ];

            mockPrescriptionRepository.find.mockResolvedValue(mockPrescriptions);

            const result = await service.findAll();

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('data', mockPrescriptions);
        });

        it('should throw NotFoundException when no prescriptions', async () => {
            mockPrescriptionRepository.find.mockResolvedValue([]);

            await expect(service.findAll()).rejects.toThrow(NotFoundException);
        });
    });

    describe('findOne', () => {
        it('should return prescription by id', async () => {
            const prescriptionId = 'prescription-1';
            const mockPrescription = {
                id: prescriptionId,
                patient: { id: 'patient-1' },
                doctor: { id: 'doctor-1' },
            };

            mockPrescriptionRepository.findOne.mockResolvedValue(mockPrescription);

            const result = await service.findOne(prescriptionId);

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('data', mockPrescription);
        });

        it('should throw NotFoundException when prescription not found', async () => {
            const prescriptionId = 'prescription-1';

            mockPrescriptionRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(prescriptionId)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('findByPatient', () => {
        it('should return prescriptions for patient', async () => {
            const patientId = 'patient-1';
            const mockPrescriptions = [
                {
                    id: 'prescription-1',
                    patient: { id: patientId },
                },
            ];

            mockPrescriptionRepository.find.mockResolvedValue(mockPrescriptions);

            const result = await service.findByPatient(patientId);

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('data', mockPrescriptions);
        });

        it('should throw NotFoundException when no prescriptions for patient', async () => {
            const patientId = 'patient-1';

            mockPrescriptionRepository.find.mockResolvedValue([]);

            await expect(service.findByPatient(patientId)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('update', () => {
        it('should successfully update prescription', async () => {
            const prescriptionId = 'prescription-1';
            const updateDto = {
                conclusion: 'Updated conclusion',
                total_fee: 150000,
            };

            const mockPrescription = {
                id: prescriptionId,
                conclusion: 'Old conclusion',
                total_fee: 100000,
                patient: { id: 'patient-1' },
                doctor: { id: 'doctor-1' },
            };

            mockPrescriptionRepository.findOne.mockResolvedValue(mockPrescription);
            mockPrescriptionRepository.save.mockResolvedValue({
                ...mockPrescription,
                ...updateDto,
            });

            const result = await service.update(prescriptionId, updateDto);

            expect(result).toHaveProperty('message', 'Cập nhật đơn thuốc thành công');
            expect(mockPrescriptionRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException when total_fee is negative', async () => {
            const prescriptionId = 'prescription-1';
            const updateDto = {
                total_fee: -100,
            };

            await expect(
                service.update(prescriptionId, updateDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when prescription not found', async () => {
            const prescriptionId = 'prescription-1';
            const updateDto = {
                conclusion: 'Updated conclusion',
            };

            mockPrescriptionRepository.findOne.mockResolvedValue(null);

            await expect(
                service.update(prescriptionId, updateDto)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should successfully remove prescription', async () => {
            const prescriptionId = 'prescription-1';
            const mockPrescription = {
                id: prescriptionId,
            };

            mockPrescriptionRepository.findOne.mockResolvedValue(mockPrescription);
            mockPrescriptionRepository.remove.mockResolvedValue(mockPrescription);

            const result = await service.remove(prescriptionId);

            expect(result).toHaveProperty('message', 'Xóa đơn thuốc thành công');
            expect(mockPrescriptionRepository.remove).toHaveBeenCalled();
        });

        it('should throw NotFoundException when prescription not found', async () => {
            const prescriptionId = 'prescription-1';

            mockPrescriptionRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(prescriptionId)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('findPendingPrescriptions', () => {
        it('should return pending prescriptions', async () => {
            const mockPrescriptions = [
                {
                    id: 'prescription-1',
                    status: PrescriptionStatus.PENDING,
                    patient: { id: 'patient-1', user: { full_name: 'Test Patient' } },
                    doctor: { id: 'doctor-1', user: { full_name: 'Dr. Test' } },
                },
            ];

            mockPrescriptionRepository.find.mockResolvedValue(mockPrescriptions);

            const result = await service.findPendingPrescriptions();

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('data', mockPrescriptions);
        });
    });

    describe('approvePrescription', () => {
        const prescriptionId = 'prescription-1';
        const userId = 'user-1';

        const mockPrescription = {
            id: prescriptionId,
            status: PrescriptionStatus.PENDING,
            details: [
                {
                    id: 'detail-1',
                    quantity: 2,
                    medicine: {
                        id: 'medicine-1',
                        name: 'Paracetamol',
                        stock: 100,
                    },
                },
            ],
        };

        const mockPharmacist = {
            id: 'pharmacist-1',
            user: { id: userId, full_name: 'Pharmacist' },
        };

        it('should successfully approve prescription', async () => {
            mockPrescriptionRepository.findOne
                .mockResolvedValueOnce(mockPrescription)
                .mockResolvedValueOnce({
                    ...mockPrescription,
                    status: PrescriptionStatus.APPROVED,
                    patient: { id: 'patient-1', user: { full_name: 'Test Patient' } },
                    doctor: { id: 'doctor-1', user: { full_name: 'Dr. Test' } },
                    approved_by: mockPharmacist,
                    medical_record: { id: 'record-1' },
                });
            mockStaffRepository.findOne.mockResolvedValue(mockPharmacist);
            mockMedicineRepository.save.mockResolvedValue({
                ...mockPrescription.details[0].medicine,
                stock: 98,
            });
            mockPrescriptionRepository.save.mockResolvedValue({
                ...mockPrescription,
                status: PrescriptionStatus.APPROVED,
            });

            const result = await service.approvePrescription(prescriptionId, userId);

            expect(result).toHaveProperty('message', 'Duyệt đơn thuốc thành công');
            expect(mockMedicineRepository.save).toHaveBeenCalled();
            expect(mockPrescriptionRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when prescription not found', async () => {
            mockPrescriptionRepository.findOne.mockResolvedValue(null);

            await expect(
                service.approvePrescription(prescriptionId, userId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when prescription is not pending', async () => {
            const approvedPrescription = {
                ...mockPrescription,
                status: PrescriptionStatus.APPROVED,
            };

            mockPrescriptionRepository.findOne.mockResolvedValue(approvedPrescription);

            await expect(
                service.approvePrescription(prescriptionId, userId)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when pharmacist not found', async () => {
            mockPrescriptionRepository.findOne.mockResolvedValue(mockPrescription);
            mockStaffRepository.findOne.mockResolvedValue(null);

            await expect(
                service.approvePrescription(prescriptionId, userId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when medicine stock is insufficient', async () => {
            const prescriptionWithLowStock = {
                ...mockPrescription,
                details: [
                    {
                        id: 'detail-1',
                        quantity: 200,
                        medicine: {
                            id: 'medicine-1',
                            name: 'Paracetamol',
                            stock: 100,
                        },
                    },
                ],
            };

            mockPrescriptionRepository.findOne.mockResolvedValue(
                prescriptionWithLowStock
            );
            mockStaffRepository.findOne.mockResolvedValue(mockPharmacist);

            await expect(
                service.approvePrescription(prescriptionId, userId)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('getRecentActivity', () => {
        it('should return recent activity for pharmacist', async () => {
            const userId = 'user-1';
            const mockPharmacist = {
                id: 'pharmacist-1',
                user: { id: userId },
            };

            const mockPrescriptions = [
                {
                    id: 'prescription-1',
                    status: PrescriptionStatus.APPROVED,
                    patient: { id: 'patient-1', user: { full_name: 'Test Patient' } },
                    doctor: { id: 'doctor-1', user: { full_name: 'Dr. Test' } },
                },
            ];

            mockStaffRepository.findOne.mockResolvedValue(mockPharmacist);
            mockPrescriptionRepository.find.mockResolvedValue(mockPrescriptions);

            const result = await service.getRecentActivity(userId);

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('data', mockPrescriptions);
        });

        it('should throw NotFoundException when pharmacist not found', async () => {
            const userId = 'user-1';

            mockStaffRepository.findOne.mockResolvedValue(null);

            await expect(service.getRecentActivity(userId)).rejects.toThrow(
                NotFoundException
            );
        });
    });
});






