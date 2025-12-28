import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { MedicalTicketService } from '../src/api/medical-ticket/medical-ticket.service';
import { MedicalTicket } from '../src/shared/entities/medical-ticket.entity';
import { Visit } from '../src/shared/entities/visit.entity';
import { Staff } from '../src/shared/entities/staff.entity';
import dayjs from 'dayjs';

describe('MedicalTicketService', () => {
    let service: MedicalTicketService;
    let ticketRepo: Repository<MedicalTicket>;
    let visitRepo: Repository<Visit>;
    let staffRepo: Repository<Staff>;

    const mockTicketRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
        exists: jest.fn(),
    };

    const mockVisitRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockStaffRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MedicalTicketService,
                {
                    provide: getRepositoryToken(MedicalTicket),
                    useValue: mockTicketRepository,
                },
                {
                    provide: getRepositoryToken(Visit),
                    useValue: mockVisitRepository,
                },
                {
                    provide: getRepositoryToken(Staff),
                    useValue: mockStaffRepository,
                },
            ],
        }).compile();

        service = module.get<MedicalTicketService>(MedicalTicketService);
        ticketRepo = module.get<Repository<MedicalTicket>>(
            getRepositoryToken(MedicalTicket)
        );
        visitRepo = module.get<Repository<Visit>>(getRepositoryToken(Visit));
        staffRepo = module.get<Repository<Staff>>(getRepositoryToken(Staff));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createMedicalTicket', () => {
        const visitId = 'visit-1';
        const mockUser = { full_name: 'Test User' };

        const mockDoctor = {
            id: 'doctor-1',
            user: { full_name: 'Dr. Test' },
            room: { id: 'room-1' },
        };

        const mockPatient = {
            id: 'patient-1',
            patient_full_name: 'Test Patient',
            patient_dob: new Date('1990-01-01'),
            patient_phone: '0123456789',
            patient_address: 'Test Address',
        };

        const mockVisit = {
            id: visitId,
            doctor: mockDoctor,
            patient: mockPatient,
            queue_number: 1,
            created_at: new Date(),
        };

        const mockTicket = {
            id: 'ticket-1',
            barcode: 'MT-20240101-001-PATIE-ABCD',
            visit_id: { id: visitId },
            assigned_doctor_id: { id: 'doctor-1' },
            clinical_fee: 150000,
            issued_at: new Date(),
        };

        it('should successfully create medical ticket', async () => {
            mockVisitRepository.findOne.mockResolvedValue(mockVisit);
            mockTicketRepository.findOne.mockResolvedValue(null);
            mockTicketRepository.exists.mockResolvedValue(false);
            mockTicketRepository.count.mockResolvedValue(0);
            mockTicketRepository.create.mockReturnValue(mockTicket);
            mockTicketRepository.save.mockResolvedValue(mockTicket);
            mockVisitRepository.save.mockResolvedValue({
                ...mockVisit,
                is_printed: true,
            });
            mockTicketRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
                ...mockTicket,
                visit_id: mockVisit,
            });

            const result = await service.createMedicalTicket(visitId, mockUser);

            expect(result).toHaveProperty('ticket_id');
            expect(result).toHaveProperty('barcode');
            expect(result).toHaveProperty('createdByName', 'Test User');
            expect(mockTicketRepository.save).toHaveBeenCalled();
            expect(mockVisitRepository.save).toHaveBeenCalled();
        });

        it('should return existing ticket if already created', async () => {
            const existingTicket = {
                ...mockTicket,
                visit_id: mockVisit,
            };

            mockVisitRepository.findOne.mockResolvedValue(mockVisit);
            mockTicketRepository.findOne.mockResolvedValue(existingTicket);

            const result = await service.createMedicalTicket(visitId, mockUser);

            expect(result).toHaveProperty('ticket_id', 'ticket-1');
            expect(mockTicketRepository.save).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when visit not found', async () => {
            mockVisitRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createMedicalTicket(visitId, mockUser)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when visit has no doctor', async () => {
            mockVisitRepository.findOne.mockResolvedValue({
                ...mockVisit,
                doctor: null,
            });

            await expect(
                service.createMedicalTicket(visitId, mockUser)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when visit has no patient', async () => {
            mockVisitRepository.findOne.mockResolvedValue({
                ...mockVisit,
                patient: null,
            });

            await expect(
                service.createMedicalTicket(visitId, mockUser)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when visit is not from today', async () => {
            const oldVisit = {
                ...mockVisit,
                created_at: dayjs().subtract(1, 'day').toDate(),
            };

            mockVisitRepository.findOne.mockResolvedValue(oldVisit);

            await expect(
                service.createMedicalTicket(visitId, mockUser)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException when cannot generate unique barcode', async () => {
            mockVisitRepository.findOne.mockResolvedValue(mockVisit);
            mockTicketRepository.findOne.mockResolvedValue(null);
            mockTicketRepository.exists.mockResolvedValue(true); // Always exists

            await expect(
                service.createMedicalTicket(visitId, mockUser)
            ).rejects.toThrow(InternalServerErrorException);
        });

        it('should generate unique barcode after retries', async () => {
            mockVisitRepository.findOne.mockResolvedValue(mockVisit);
            mockTicketRepository.findOne
                .mockResolvedValueOnce(null) // First call for existing ticket check
                .mockResolvedValueOnce(null); // Second call for saved ticket
            mockTicketRepository.exists
                .mockResolvedValueOnce(true) // First attempt fails
                .mockResolvedValueOnce(true) // Second attempt fails
                .mockResolvedValueOnce(true) // Third attempt fails
                .mockResolvedValueOnce(true) // Fourth attempt fails
                .mockResolvedValueOnce(false); // Fifth attempt succeeds
            mockTicketRepository.count.mockResolvedValue(0);
            mockTicketRepository.create.mockReturnValue(mockTicket);
            mockTicketRepository.save.mockResolvedValue(mockTicket);
            mockVisitRepository.save.mockResolvedValue({
                ...mockVisit,
                is_printed: true,
            });

            const result = await service.createMedicalTicket(visitId, mockUser);

            expect(result).toHaveProperty('ticket_id');
            expect(mockTicketRepository.exists).toHaveBeenCalledTimes(5);
        });
    });
});






