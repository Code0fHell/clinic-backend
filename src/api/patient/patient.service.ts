import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../shared/entities/patient.entity';
import { User } from '../../shared/entities/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { LinkPatientAccountDto } from './dto/link-patient-account.dto';
import { UpdatePatientVitalsDto } from './dto/update-patient-vitals.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }


    // Lễ tân tạo hồ sơ bệnh nhân chưa có tài khoản
    async createPatientWithoutAccount(dto: CreatePatientDto): Promise<Patient> {
        const existing = await this.patientRepo.findOne({
            where: { patient_phone: dto.patient_phone },
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
            father_name: dto.father_name,
            mother_name: dto.mother_name,
            father_phone: dto.father_phone,
            mother_phone: dto.mother_phone,
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
