import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentService } from '../src/api/appointment/appointment.service';
import { WorkScheduleDetail } from '../src/shared/entities/work-schedule-detail.entity';
import { Staff } from '../src/shared/entities/staff.entity';
import { Patient } from '../src/shared/entities/patient.entity';
import { Appointment } from '../src/shared/entities/appointment.entity';
import { User } from '../src/shared/entities/user.entity';
import { NotificationService } from '../src/api/notification/notification.service';
import { AppointmentStatus } from '../src/shared/enums/appointment-status.enum';
import { UserRole } from '../src/shared/enums/user-role.enum';
import dayjs from 'dayjs';

describe('AppointmentService', () => {
    let service: AppointmentService;
    let workScheduleDetailRepo: Repository<WorkScheduleDetail>;
    let staffRepo: Repository<Staff>;
    let patientRepo: Repository<Patient>;
    let appointmentRepo: Repository<Appointment>;
    let userRepo: Repository<User>;
    let notificationService: NotificationService;

    const mockWorkScheduleDetailRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockStaffRepository = {
        findOne: jest.fn(),
    };

    const mockPatientRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockAppointmentRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockNotificationService = {
        createAppointmentNotification: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentService,
                {
                    provide: getRepositoryToken(WorkScheduleDetail),
                    useValue: mockWorkScheduleDetailRepository,
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
                    provide: getRepositoryToken(Appointment),
                    useValue: mockAppointmentRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        }).compile();

        service = module.get<AppointmentService>(AppointmentService);
        workScheduleDetailRepo = module.get<Repository<WorkScheduleDetail>>(
            getRepositoryToken(WorkScheduleDetail)
        );
        staffRepo = module.get<Repository<Staff>>(getRepositoryToken(Staff));
        patientRepo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
        appointmentRepo = module.get<Repository<Appointment>>(
            getRepositoryToken(Appointment)
        );
        userRepo = module.get<Repository<User>>(getRepositoryToken(User));
        notificationService = module.get<NotificationService>(NotificationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAvailableSlots', () => {
        it('should return available slots for a schedule', async () => {
            const scheduleId = 'schedule-1';
            const mockSlots = [
                { id: 'slot-1', slot_start: new Date(), is_booked: false },
                { id: 'slot-2', slot_start: new Date(), is_booked: false },
            ];

            mockWorkScheduleDetailRepository.find.mockResolvedValue(mockSlots);

            const result = await service.getAvailableSlots(scheduleId);

            expect(result).toEqual(mockSlots);
            expect(mockWorkScheduleDetailRepository.find).toHaveBeenCalledWith({
                where: { schedule: { id: scheduleId }, is_booked: false },
                order: { slot_start: 'ASC' },
            });
        });

        it('should return empty array when no slots available', async () => {
            const scheduleId = 'schedule-1';
            mockWorkScheduleDetailRepository.find.mockResolvedValue([]);

            const result = await service.getAvailableSlots(scheduleId);

            expect(result).toEqual([]);
        });
    });

    describe('bookAppointment', () => {
        const userId = 'user-1';
        const mockDto = {
            doctor_id: 'doctor-1',
            schedule_detail_id: 'slot-1',
            scheduled_date: dayjs().add(1, 'day').toDate(),
            reason: 'Regular checkup',
        };

        const mockUser = {
            id: userId,
            patient: {
                id: 'patient-1',
                patient_full_name: 'Test Patient',
            },
        };

        const mockDoctor = {
            id: 'doctor-1',
            user: { full_name: 'Dr. Test' },
        };

        const mockSlot = {
            id: 'slot-1',
            is_booked: false,
            slot_start: dayjs().add(1, 'day').hour(10).toDate(),
            schedule: {
                id: 'schedule-1',
                work_date: dayjs().add(1, 'day').toDate(),
                staff: { id: 'doctor-1' },
            },
        };

        const mockAppointment = {
            id: 'appointment-1',
            doctor: mockDoctor,
            patient: mockUser.patient,
            scheduled_date: mockSlot.slot_start,
            status: AppointmentStatus.PENDING,
        };

        it('should successfully book an appointment', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue(mockSlot);
            mockAppointmentRepository.create.mockReturnValue(mockAppointment);
            mockAppointmentRepository.save.mockResolvedValue(mockAppointment);
            mockWorkScheduleDetailRepository.save.mockResolvedValue({
                ...mockSlot,
                is_booked: true,
            });
            mockNotificationService.createAppointmentNotification.mockResolvedValue({});

            const result = await service.bookAppointment(userId, mockDto);

            expect(result).toHaveProperty('message', 'Appointment booked');
            expect(result).toHaveProperty('appointmentId', 'appointment-1');
            expect(mockAppointmentRepository.save).toHaveBeenCalled();
            expect(mockWorkScheduleDetailRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException for invalid date', async () => {
            const invalidDto = {
                ...mockDto,
                scheduled_date: dayjs().subtract(1, 'day').toDate(),
            };

            await expect(
                service.bookAppointment(userId, invalidDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException for date more than 30 days', async () => {
            const invalidDto = {
                ...mockDto,
                scheduled_date: dayjs().add(31, 'day').toDate(),
            };

            await expect(
                service.bookAppointment(userId, invalidDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw error when user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(
                service.bookAppointment(userId, mockDto)
            ).rejects.toThrow('User not found');
        });

        it('should throw error when patient not found', async () => {
            mockUserRepository.findOne.mockResolvedValue({
                ...mockUser,
                patient: null,
            });

            await expect(
                service.bookAppointment(userId, mockDto)
            ).rejects.toThrow('Patient not found for this user');
        });

        it('should throw BadRequestException when doctor not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(null);

            await expect(
                service.bookAppointment(userId, mockDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when slot not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue(null);

            await expect(
                service.bookAppointment(userId, mockDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when slot is already booked', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue({
                ...mockSlot,
                is_booked: true,
            });

            await expect(
                service.bookAppointment(userId, mockDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when doctor does not work on that date', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue({
                ...mockSlot,
                schedule: {
                    ...mockSlot.schedule,
                    staff: { id: 'doctor-2' },
                },
            });

            await expect(
                service.bookAppointment(userId, mockDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should handle notification failure gracefully', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue(mockSlot);
            mockAppointmentRepository.create.mockReturnValue(mockAppointment);
            mockAppointmentRepository.save.mockResolvedValue(mockAppointment);
            mockWorkScheduleDetailRepository.save.mockResolvedValue({
                ...mockSlot,
                is_booked: true,
            });
            mockNotificationService.createAppointmentNotification.mockRejectedValue(
                new Error('Notification failed')
            );

            const result = await service.bookAppointment(userId, mockDto);

            expect(result).toHaveProperty('message', 'Appointment booked');
        });
    });

    describe('guestBookAppointment', () => {
        const mockDto = {
            full_name: 'Guest Patient',
            dob: '1990-01-01',
            gender: 'NAM',
            phone: '0123456789',
            email: 'guest@test.com',
            reason: 'Checkup',
            doctor_id: 'doctor-1',
            schedule_detail_id: 'slot-1',
            scheduled_date: dayjs().add(1, 'day').toDate(),
        };

        const mockDoctor = {
            id: 'doctor-1',
            user: { full_name: 'Dr. Test' },
        };

        const mockSlot = {
            id: 'slot-1',
            is_booked: false,
            slot_start: dayjs().add(1, 'day').hour(10).toDate(),
            schedule: {
                id: 'schedule-1',
                work_date: dayjs().add(1, 'day').toDate(),
                staff: { id: 'doctor-1' },
            },
        };

        const mockUser = {
            id: 'user-guest-1',
            full_name: 'Guest Patient',
            email: 'guest@test.com',
        };

        const mockPatient = {
            id: 'patient-guest-1',
            patient_full_name: 'Guest Patient',
        };

        const mockAppointment = {
            id: 'appointment-guest-1',
            doctor: mockDoctor,
            patient: mockPatient,
        };

        it('should successfully book appointment for guest', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue(mockSlot);
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockPatientRepository.create.mockReturnValue(mockPatient);
            mockPatientRepository.save.mockResolvedValue(mockPatient);
            mockWorkScheduleDetailRepository.save.mockResolvedValue({
                ...mockSlot,
                is_booked: true,
            });
            mockAppointmentRepository.create.mockReturnValue(mockAppointment);
            mockAppointmentRepository.save.mockResolvedValue(mockAppointment);
            mockNotificationService.createAppointmentNotification.mockResolvedValue({});

            const result = await service.guestBookAppointment(mockDto);

            expect(result).toHaveProperty('message', 'Appointment booked');
            expect(mockUserRepository.save).toHaveBeenCalled();
            expect(mockPatientRepository.save).toHaveBeenCalled();
            expect(mockAppointmentRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException for invalid date', async () => {
            const invalidDto = {
                ...mockDto,
                scheduled_date: dayjs().subtract(1, 'day').toDate(),
            };

            await expect(
                service.guestBookAppointment(invalidDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when doctor not found', async () => {
            mockStaffRepository.findOne.mockResolvedValue(null);

            await expect(
                service.guestBookAppointment(mockDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when slot is already booked', async () => {
            mockStaffRepository.findOne.mockResolvedValue(mockDoctor);
            mockWorkScheduleDetailRepository.findOne.mockResolvedValue({
                ...mockSlot,
                is_booked: true,
            });

            await expect(
                service.guestBookAppointment(mockDto)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('getAllAppointments', () => {
        it('should return all appointments', async () => {
            const mockAppointments = [
                {
                    id: 'appointment-1',
                    scheduled_date: new Date(),
                },
                {
                    id: 'appointment-2',
                    scheduled_date: new Date(),
                },
            ];

            mockAppointmentRepository.find.mockResolvedValue(mockAppointments);

            const result = await service.getAllAppointments();

            expect(result).toEqual(mockAppointments);
            expect(mockAppointmentRepository.find).toHaveBeenCalledWith({
                relations: ['doctor', 'doctor.user', 'patient', 'schedule_detail'],
                order: { appointment_date: 'ASC' },
            });
        });
    });

    describe('getTodayAppointments', () => {
        const userId = 'user-1';

        it('should return today appointments for doctor', async () => {
            const mockUser = {
                id: userId,
                user_role: UserRole.DOCTOR,
                staff: { id: 'staff-1' },
            };

            const mockAppointments = [
                {
                    id: 'appointment-1',
                    scheduled_date: new Date(),
                },
            ];

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockAppointmentRepository.find.mockResolvedValue(mockAppointments);

            const result = await service.getTodayAppointments(userId);

            expect(result).toEqual(mockAppointments);
        });

        it('should return today appointments for receptionist', async () => {
            const mockUser = {
                id: userId,
                user_role: UserRole.RECEPTIONIST,
                staff: null,
            };

            const mockAppointments = [
                {
                    id: 'appointment-1',
                    scheduled_date: new Date(),
                },
            ];

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockAppointmentRepository.find.mockResolvedValue(mockAppointments);

            const result = await service.getTodayAppointments(userId);

            expect(result).toEqual(mockAppointments);
        });

        it('should throw NotFoundException when user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(
                service.getTodayAppointments(userId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when doctor has no staff profile', async () => {
            const mockUser = {
                id: userId,
                user_role: UserRole.DOCTOR,
                staff: null,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            await expect(
                service.getTodayAppointments(userId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException for invalid role', async () => {
            const mockUser = {
                id: userId,
                user_role: UserRole.PATIENT,
                staff: null,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            await expect(
                service.getTodayAppointments(userId)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateAppointmentStatus', () => {
        it('should successfully update appointment status', async () => {
            const appointmentId = 'appointment-1';
            const newStatus = AppointmentStatus.CHECKED_IN;
            const mockAppointment = {
                id: appointmentId,
                status: AppointmentStatus.PENDING,
            };

            mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
            mockAppointmentRepository.save.mockResolvedValue({
                ...mockAppointment,
                status: newStatus,
            });

            const result = await service.updateAppointmentStatus(
                appointmentId,
                newStatus
            );

            expect(result).toHaveProperty('message', 'Appointment status updated');
            expect(result).toHaveProperty('status', newStatus);
        });

        it('should return error message when appointment not found', async () => {
            const appointmentId = 'appointment-1';
            const newStatus = AppointmentStatus.CHECKED_IN;

            mockAppointmentRepository.findOne.mockResolvedValue(null);

            const result = await service.updateAppointmentStatus(
                appointmentId,
                newStatus
            );

            expect(result).toHaveProperty(
                'message',
                'Failed to update appointment status'
            );
            expect(result).toHaveProperty('error');
        });
    });

    describe('getAppointmentsThisWeek', () => {
        it('should return appointments for this week', async () => {
            const mockAppointments = [
                {
                    id: 'appointment-1',
                    scheduled_date: new Date(),
                },
            ];

            mockAppointmentRepository.find.mockResolvedValue(mockAppointments);

            const result = await service.getAppointmentsThisWeek();

            expect(result).toEqual(mockAppointments);
            expect(mockAppointmentRepository.find).toHaveBeenCalled();
        });
    });

    describe('getUserWithStaff', () => {
        it('should return staff id for user with staff', async () => {
            const userId = 'user-1';
            const mockUser = {
                id: userId,
                staff: { id: 'staff-1' },
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.getUserWithStaff(userId);

            expect(result).toBe('staff-1');
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 'user-1';
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.getUserWithStaff(userId)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw NotFoundException when user has no staff', async () => {
            const userId = 'user-1';
            const mockUser = {
                id: userId,
                staff: null,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.getUserWithStaff(userId)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('getUserWithRole', () => {
        it('should return user with role and staff id', async () => {
            const userId = 'user-1';
            const mockUser = {
                id: userId,
                user_role: UserRole.DOCTOR,
                staff: { id: 'staff-1' },
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.getUserWithRole(userId);

            expect(result).toHaveProperty('user', mockUser);
            expect(result).toHaveProperty('role', UserRole.DOCTOR);
            expect(result).toHaveProperty('staffId', 'staff-1');
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 'user-1';
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.getUserWithRole(userId)).rejects.toThrow(
                NotFoundException
            );
        });
    });
});






