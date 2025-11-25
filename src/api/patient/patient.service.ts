import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../shared/entities/patient.entity';
import { User } from '../../shared/entities/user.entity';
import { WorkScheduleDetail } from 'src/shared/entities/work-schedule-detail.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { WorkSchedule } from 'src/shared/entities/work-schedule.entity';
import { Between } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { LinkPatientAccountDto } from './dto/link-patient-account.dto';
import { UpdatePatientVitalsDto } from './dto/update-patient-vitals.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,

        @InjectRepository(WorkSchedule)
        private readonly workScheduleRepository: Repository<WorkSchedule>,

        @InjectRepository(WorkScheduleDetail)
        private workScheduleDetailRepository: Repository<WorkScheduleDetail>,
    ) { }


    // Lễ tân tạo hồ sơ bệnh nhân chưa có tài khoản
    async createPatientWithoutAccount(dto: CreatePatientDto): Promise<Patient> {
        const existing = await this.patientRepo.findOne({
            where: [
                { patient_phone: dto.patient_phone },
                { fatherORmother_phone: dto.patient_phone },
                { patient_phone: dto.fatherORmother_phone },
                { fatherORmother_phone: dto.fatherORmother_phone },
            ],
        });
        if (existing) {
            throw new ConflictException('Bệnh nhân với số điện thoại này đã tồn tại');
        }

        const patient = this.patientRepo.create({
            patient_full_name: dto.patient_full_name,
            patient_address: dto.patient_address,
            patient_phone: dto.patient_phone,
            patient_dob: dto.patient_dob,
            patient_gender: dto.patient_gender,
            fatherORmother_name: dto.fatherORmother_name,
            fatherORmother_phone: dto.fatherORmother_phone,
            height: dto.height,
            weight: dto.weight,
            blood_type: dto.blood_type,
            respiratory_rate: dto.respiratory_rate,
            blood_pressure: dto.blood_pressure,
            pulse_rate: dto.pulse_rate,
            medical_history: dto.medical_history,
            user: null
        });
        return await this.patientRepo.save(patient);
    }

    // Cập nhật bệnh nhân
    async updatePatient(id: string, dto: UpdatePatientDto): Promise<Patient> {
        const patient = await this.patientRepo.findOne({ where: { id } });
        if (!patient) {
            throw new NotFoundException('Không tìm thấy bệnh nhân cần cập nhật');
        }

        // Kiểm tra số điện thoại trùng (nếu có thay đổi)
        if (dto.patient_phone && dto.patient_phone !== patient.patient_phone) {
            const existing = await this.patientRepo.findOne({
                where: { patient_phone: dto.patient_phone },
            });
            if (existing) {
                throw new ConflictException('Số điện thoại đã được sử dụng cho bệnh nhân khác');
            }
        }

        Object.assign(patient, dto);

        return await this.patientRepo.save(patient);
    }

    // Lấy ra danh sách tất cả bệnh nhân
    async getAllPatient() {
        const patients = await this.patientRepo.find();

        if (patients.length === 0) {
            return {
                message: "Không có bệnh nhân",
                data: [],
            };
        }

        return {
            message: "Lấy danh sách bệnh nhân thành công",
            data: patients,
        };
    }


    // Ánh xạ tài khoản vừa đăng ký sang hồ sơ bệnh nhân có sẵn
    async linkAccountToExistingPatient(dto: LinkPatientAccountDto): Promise<Patient> {
        const { userId, phone } = dto;

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('Không tìm thấy tài khoản người dùng');

        if (user.user_role !== UserRole.PATIENT) {
            throw new ConflictException('Chỉ tài khoản bệnh nhân mới được ánh xạ hồ sơ');
        }

        const patient = await this.patientRepo.findOne({
            where: { patient_phone: phone },
            relations: ['user'], // cần quan hệ user để kiểm tra
        });
        if (!patient) throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');

        if (patient.user != null) {
            if (patient.user.id === user.id) {
                return patient;
            }
            throw new ConflictException('Hồ sơ này đã được ánh xạ với tài khoản khác');
        }

        const isMatch =
            user.full_name === patient.patient_full_name &&
            user.phone === patient.patient_phone

        if (!isMatch) {
            throw new ConflictException('Thông tin tài khoản không trùng khớp với hồ sơ bệnh nhân');
        }

        const existingPatient = await this.patientRepo.findOne({
            where: { user: { id: user.id } },
        });
        if (existingPatient) {
            throw new ConflictException('Tài khoản này đã được ánh xạ với hồ sơ bệnh nhân khác');
        }

        patient.user = user;
        return await this.patientRepo.save(patient);
    }

    // Lấy bác sĩ có sẵn
    async getAvailableWorkSchedulesToday(): Promise<{ doctor: Staff; freeSlots: WorkScheduleDetail[] }[]> {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd = now.getDate().toString().padStart(2, '0');
        const todayDateString = `${yyyy}-${mm}-${dd}`;
        const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const nowString = nowVN.toISOString().slice(0, 19).replace('T', ' ');

        const schedules = await this.workScheduleRepository
            .createQueryBuilder('ws')
            .leftJoinAndSelect('ws.staff', 'staff')
            .leftJoinAndSelect('staff.room', 'room')
            .leftJoinAndSelect('staff.user', 'user')
            .leftJoinAndSelect('ws.details', 'details')
            .where('ws.work_date = :today', { today: todayDateString })
            .andWhere('details.is_booked = :isBooked', { isBooked: false })
            .andWhere('details.slot_end > :now', { now: nowString })
            .orderBy('staff.id', 'ASC')
            .addOrderBy('details.slot_start', 'ASC')
            // chỉ chọn các trường cần thiết
            .select([
                'ws.id',
                'ws.work_date',
                'staff.id',
                'staff.position',
                'staff.department',
                'staff.is_available',
                'room.id',
                'room.room_name',
                'user.id',
                'user.full_name',
                'user.email',
                'details.id',
                'details.slot_start',
                'details.slot_end',
                'details.is_booked',
            ])
            .getMany();

        // Gom dữ liệu theo bác sĩ, lọc chỉ những người còn slot trống hợp lệ
        const result = schedules
            .map((schedule) => ({
                doctor: schedule.staff,
                freeSlots: schedule.details || [],
            }))
            .filter((r) => r.freeSlots.length > 0);

        return result;
    }


    async updatePatientVitals(patientId: string, dto: UpdatePatientVitalsDto) {
        const patient = await this.patientRepo.findOne({
            where: { id: patientId },
        });

        if (!patient) {
            throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');
        }

        patient.height = dto.height ?? patient.height;
        patient.weight = dto.weight ?? patient.weight;
        patient.blood_pressure = dto.blood_pressure ?? patient.blood_pressure;
        patient.respiratory_rate = dto.respiratory_rate ?? patient.respiratory_rate;
        patient.pulse_rate = dto.pulse_rate ?? patient.pulse_rate;
        patient.medical_history = dto.medical_history ?? patient.medical_history;

        return this.patientRepo.save(patient);
    }
}
