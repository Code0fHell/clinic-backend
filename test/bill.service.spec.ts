import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BillService } from '../src/api/bill/bill.service';
import { Bill } from '../src/shared/entities/bill.entity';
import { Patient } from '../src/shared/entities/patient.entity';
import { Staff } from '../src/shared/entities/staff.entity';
import { MedicalTicket } from '../src/shared/entities/medical-ticket.entity';
import { IndicationTicket } from '../src/shared/entities/indication-ticket.entity';
import { Prescription } from '../src/shared/entities/prescription.entity';
import { BillType } from '../src/shared/enums/bill-type.enum';

describe('BillService', () => {
    let service: BillService;
    let billRepo: Repository<Bill>;
    let patientRepo: Repository<Patient>;
    let staffRepo: Repository<Staff>;
    let medicalTicketRepo: Repository<MedicalTicket>;
    let indicationTicketRepo: Repository<IndicationTicket>;
    let prescriptionRepo: Repository<Prescription>;

    const mockBillRepository = {
        create: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn(),
        findOne: jest.fn(),
    };

    const mockPatientRepository = {
        findOne: jest.fn(),
    };

    const mockStaffRepository = {
        findOne: jest.fn(),
    };

    const mockMedicalTicketRepository = {
        findOne: jest.fn(),
    };

    const mockIndicationTicketRepository = {
        findOne: jest.fn(),
    };

    const mockPrescriptionRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BillService,
                {
                    provide: getRepositoryToken(Bill),
                    useValue: mockBillRepository,
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
                    provide: getRepositoryToken(MedicalTicket),
                    useValue: mockMedicalTicketRepository,
                },
                {
                    provide: getRepositoryToken(IndicationTicket),
                    useValue: mockIndicationTicketRepository,
                },
                {
                    provide: getRepositoryToken(Prescription),
                    useValue: mockPrescriptionRepository,
                },
            ],
        }).compile();

        service = module.get<BillService>(BillService);
        billRepo = module.get<Repository<Bill>>(getRepositoryToken(Bill));
        patientRepo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
        staffRepo = module.get<Repository<Staff>>(getRepositoryToken(Staff));
        medicalTicketRepo = module.get<Repository<MedicalTicket>>(
            getRepositoryToken(MedicalTicket)
        );
        indicationTicketRepo = module.get<Repository<IndicationTicket>>(
            getRepositoryToken(IndicationTicket)
        );
        prescriptionRepo = module.get<Repository<Prescription>>(
            getRepositoryToken(Prescription)
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createBill', () => {
        const mockPatient = {
            id: 'patient-1',
            patient_full_name: 'Test Patient',
        };

        const mockDoctor = {
            id: 'doctor-1',
            user: { full_name: 'Dr. Test' },
        };

        it('should create bill for clinical type', async () => {
            const dto = {
                bill_type: BillType.CLINICAL,
                patient_id: 'patient-1',
                medical_ticket_id: 'ticket-1',
            };

            const mockMedicalTicket = {
                id: 'ticket-1',
                clinical_fee: 150000,
                assigned_doctor_id: mockDoctor,
            };

            const mockBill = {
                id: 'bill-1',
                bill_type: BillType.CLINICAL,
                patient: mockPatient,
                doctor: mockDoctor,
                medical_ticket: mockMedicalTicket,
                total: 150000,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockMedicalTicketRepository.findOne.mockResolvedValue(mockMedicalTicket);
            mockBillRepository.create.mockReturnValue(mockBill);
            mockBillRepository.save.mockResolvedValue(mockBill);

            const result = await service.createBill(dto);

            expect(result).toEqual(mockBill);
            expect(result.total).toBe(150000);
        });

        it('should throw BadRequestException when clinical fee is missing', async () => {
            const dto = {
                bill_type: BillType.CLINICAL,
                patient_id: 'patient-1',
                medical_ticket_id: 'ticket-1',
            };

            const mockMedicalTicket = {
                id: 'ticket-1',
                clinical_fee: null,
                assigned_doctor_id: mockDoctor,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockMedicalTicketRepository.findOne.mockResolvedValue(mockMedicalTicket);

            await expect(service.createBill(dto)).rejects.toThrow(BadRequestException);
        });

        it('should create bill for service type', async () => {
            const dto = {
                bill_type: BillType.SERVICE,
                patient_id: 'patient-1',
                indication_ticket_id: 'indication-1',
            };

            const mockIndicationTicket = {
                id: 'indication-1',
                total_fee: 200000,
                doctor: mockDoctor,
            };

            const mockBill = {
                id: 'bill-1',
                bill_type: BillType.SERVICE,
                patient: mockPatient,
                doctor: mockDoctor,
                indication_ticket: mockIndicationTicket,
                total: 200000,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockIndicationTicketRepository.findOne.mockResolvedValue(mockIndicationTicket);
            mockBillRepository.create.mockReturnValue(mockBill);
            mockBillRepository.save.mockResolvedValue(mockBill);

            const result = await service.createBill(dto);

            expect(result).toEqual(mockBill);
            expect(result.total).toBe(200000);
        });

        it('should create bill for medicine type', async () => {
            const dto = {
                bill_type: BillType.MEDICINE,
                patient_id: 'patient-1',
                prescription_id: 'prescription-1',
            };

            const mockMedicine = {
                id: 'medicine-1',
                price: 50000,
            };

            const mockPrescription = {
                id: 'prescription-1',
                total_fee: 100000,
                doctor: mockDoctor,
                details: [
                    {
                        medicine: mockMedicine,
                        quantity: 2,
                    },
                ],
            };

            const mockBill = {
                id: 'bill-1',
                bill_type: BillType.MEDICINE,
                patient: mockPatient,
                doctor: mockDoctor,
                prescription: mockPrescription,
                total: 100000,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockPrescriptionRepository.findOne.mockResolvedValue(mockPrescription);
            mockBillRepository.create.mockReturnValue(mockBill);
            mockBillRepository.save.mockResolvedValue(mockBill);

            const result = await service.createBill(dto);

            expect(result).toEqual(mockBill);
        });

        it('should calculate total from prescription details when total_fee is missing', async () => {
            const dto = {
                bill_type: BillType.MEDICINE,
                patient_id: 'patient-1',
                prescription_id: 'prescription-1',
            };

            const mockMedicine = {
                id: 'medicine-1',
                price: 50000,
            };

            const mockPrescription = {
                id: 'prescription-1',
                total_fee: null,
                doctor: mockDoctor,
                details: [
                    {
                        medicine: mockMedicine,
                        quantity: 2,
                    },
                ],
            };

            const mockBill = {
                id: 'bill-1',
                bill_type: BillType.MEDICINE,
                patient: mockPatient,
                doctor: mockDoctor,
                prescription: mockPrescription,
                total: 100000,
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockPrescriptionRepository.findOne.mockResolvedValue(mockPrescription);
            mockBillRepository.create.mockReturnValue(mockBill);
            mockBillRepository.save.mockResolvedValue(mockBill);

            const result = await service.createBill(dto);

            expect(result.total).toBe(100000);
        });

        it('should throw BadRequestException when prescription has no fee information', async () => {
            const dto = {
                bill_type: BillType.MEDICINE,
                patient_id: 'patient-1',
                prescription_id: 'prescription-1',
            };

            const mockPrescription = {
                id: 'prescription-1',
                total_fee: null,
                doctor: mockDoctor,
                details: [],
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockPrescriptionRepository.findOne.mockResolvedValue(mockPrescription);

            await expect(service.createBill(dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when patient not found', async () => {
            const dto = {
                bill_type: BillType.CLINICAL,
                patient_id: 'patient-1',
                medical_ticket_id: 'ticket-1',
            };

            mockPatientRepository.findOne.mockResolvedValue(null);

            await expect(service.createBill(dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when medical ticket not found', async () => {
            const dto = {
                bill_type: BillType.CLINICAL,
                patient_id: 'patient-1',
                medical_ticket_id: 'ticket-1',
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);
            mockMedicalTicketRepository.findOne.mockResolvedValue(null);

            await expect(service.createBill(dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for invalid bill type', async () => {
            const dto = {
                bill_type: 'INVALID' as BillType,
                patient_id: 'patient-1',
            };

            mockPatientRepository.findOne.mockResolvedValue(mockPatient);

            await expect(service.createBill(dto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getAllBillToday', () => {
        it('should return all bills for today', async () => {
            const mockUser = { full_name: 'Test User' };
            const mockBills = [
                {
                    id: 'bill-1',
                    total: 150000,
                    bill_type: BillType.CLINICAL,
                    created_at: new Date(),
                    patient: { patient_full_name: 'Test Patient' },
                    payments: [],
                },
            ];

            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockBills),
            };

            mockBillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.getAllBillToday(mockUser);

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('createdByName', 'Test User');
        });
    });

    describe('getDetailBill', () => {
        it('should return bill details', async () => {
            const billId = 'bill-1';
            const mockBill = {
                id: billId,
                total: 150000,
            };

            mockBillRepository.findOne.mockResolvedValue(mockBill);

            const result = await service.getDetailBill(billId);

            expect(result).toHaveProperty('id', billId);
            expect(result).toHaveProperty('total', 150000);
        });
    });
});






