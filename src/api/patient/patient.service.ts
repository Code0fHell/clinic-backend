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
import { CreatePatientDto } from './dto/create-patient.dto';
import { LinkPatientAccountDto } from './dto/link-patient-account.dto';
import { UpdatePatientVitalsDto } from './dto/update-patient-vitals.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDTO } from './dto/query-patient.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

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

    // Lấy ra danh sách bệnh nhân, search, phân trang
    async getAllPatient(dto: QueryPatientDTO, isExport = false) {
        const { keyword, page = 1, limit = 10, visitFilter = 'all' } = dto;
        const vietnamDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const visitDate = vietnamDate.toLocaleDateString('en-CA'); // yyyy-mm-dd
        const startOfDay = `${visitDate} 00:00:00`;
        const endOfDay = `${visitDate} 23:59:59`;
        const query = this.patientRepo.createQueryBuilder('patient');

        // ===== SEARCH =====
        if (keyword) {
            query.andWhere(
                `(patient.patient_full_name LIKE :keyword
              OR patient.patient_phone LIKE :keyword
              OR patient.fatherORmother_phone LIKE :keyword)`,
                { keyword: `%${keyword}%` }
            );
        }

        // ===== SET PARAMETERS =====
        query.setParameters({ startOfDay, endOfDay });

        // ===== FILTER THEO VISIT =====
        if (visitFilter === 'added') {
            query.andWhere(
                `EXISTS (
                SELECT 1
                FROM visit v
                WHERE v.patient_id = patient.id
                AND v.checked_in_at BETWEEN :startOfDay AND :endOfDay
            )`
            );
        }

        if (visitFilter === 'not_added') {
            query.andWhere(
                `NOT EXISTS (
                SELECT 1
                FROM visit v
                WHERE v.patient_id = patient.id
                AND v.checked_in_at BETWEEN :startOfDay AND :endOfDay
            )`
            );
        }

        // ===== FLAG hasVisitToday =====
        query.addSelect(
            `CAST(CASE 
            WHEN EXISTS (
                SELECT 1
                FROM visit v
                WHERE v.patient_id = patient.id
                AND v.checked_in_at BETWEEN :startOfDay AND :endOfDay
            )
            THEN 1
            ELSE 0
        END AS UNSIGNED)`,
            'patient_hasVisitToday'
        );

        // ===== SORT THEO TÊN =====
        query
            .orderBy(
                "SUBSTRING_INDEX(patient.patient_full_name, ' ', -1)",
                'ASC'
            )
            .addOrderBy("patient.patient_full_name", 'ASC');

        // ===== EXPORT =====
        if (isExport) {
            const results = await query.getRawAndEntities();

            const data = results.entities.map((patient, index) => {
                const hasVisitToday = results.raw[index].patient_hasVisitToday;
                return {
                    ...patient,
                    hasVisitToday: hasVisitToday === 1 || hasVisitToday === '1',
                };
            });

            return {
                message: data.length
                    ? 'Lấy danh sách bệnh nhân thành công'
                    : 'Không có bệnh nhân',
                data,
                pagination: null,
            };
        }

        // ===== PAGINATION =====
        const total = await query.getCount();

        query
            .skip((page - 1) * limit)
            .take(limit);

        const results = await query.getRawAndEntities();

        const data = results.entities.map((patient, index) => {
            const hasVisitToday = results.raw[index].patient_hasVisitToday;
            return {
                ...patient,
                hasVisitToday: hasVisitToday === 1 || hasVisitToday === '1',
            };
        });

        return {
            message: data.length
                ? 'Lấy danh sách bệnh nhân thành công'
                : 'Không có bệnh nhân',
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
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

    // Xuất dữ liệu bệnh nhân ra file excel
    async exportPatientToExcel(dto: QueryPatientDTO, res: Response) {
        const result = await this.getAllPatient(dto, true);
        const patients = result.data;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách bệnh nhân');

        // Header & Style header
        worksheet.columns = [
            { header: 'STT', key: 'index', width: 6 },
            { header: 'Họ tên', key: 'name', width: 25 },
            { header: 'Số điện thoại', key: 'phone', width: 18 },
            { header: 'Địa chỉ', key: 'address', width: 25 },
            { header: 'SĐT người thân', key: 'parentPhone', width: 18 },
            { header: 'Chiều cao', key: 'height', width: 25 },
            { header: 'Cân nặng', key: 'weight', width: 25 },
            { header: 'Giới tính', key: 'gender', width: 12 },
            { header: 'Ngày sinh', key: 'dob', width: 15 },
        ];
        worksheet.getRow(1).font = { bold: true };

        // Data
        patients.forEach((p, index) => {
            worksheet.addRow({
                index: index + 1,
                name: p.patient_full_name,
                phone: p.patient_phone,
                address: p.patient_address,
                parentPhone: p.fatherORmother_phone,
                height: p.height || '',
                weight: p.weight || '',
                gender: p.patient_gender === 'NAM' ? 'Nam' : 'Nữ',
                dob: p.patient_dob || '',
            });
        });

        // Xuất file
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=danh_sach_benh_nhan.xlsx',
        );

        await workbook.xlsx.write(res);
        res.end();
    }
}
