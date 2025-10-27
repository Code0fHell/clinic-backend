import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Prescription } from '../../shared/entities/prescription.entity';
import { Patient } from '../../shared/entities/patient.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { MedicalRecord } from '../../shared/entities/medical-record.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  // Tạo đơn thuốc mới
  async create(createPrescriptionDto: CreatePrescriptionDto) {
    // Validate total fee
    if (createPrescriptionDto.total_fee < 0) {
      throw new BadRequestException('Tổng phí không được âm');
    }

    // check patient tồn tại
    const patient = await this.patientRepository.findOne({ 
      where: { id: createPrescriptionDto.patient_id } 
    });
    if (!patient) {
      throw new NotFoundException(`Bệnh nhân với id: ${createPrescriptionDto.patient_id} không tồn tại`);
    }

    // check doctor tồn tại
    const doctor = await this.staffRepository.findOne({ 
      where: { id: createPrescriptionDto.doctor_id } 
    });
    if (!doctor) {
      throw new NotFoundException(`Bác sĩ với id: ${createPrescriptionDto.doctor_id} không tồn tại`);
    }

    // check medical record tồn tại (nếu có)
    if (createPrescriptionDto.medical_record_id) {
      const medicalRecord = await this.medicalRecordRepository.findOne({ 
        where: { id: createPrescriptionDto.medical_record_id } 
      });
      if (!medicalRecord) {
        throw new NotFoundException(`Hồ sơ bệnh án với id: ${createPrescriptionDto.medical_record_id} không tồn tại`);
      }
    }

    // tạo đơn thuốc mới
    const prescription = this.prescriptionRepository.create({
      ...createPrescriptionDto,
      patient,
      doctor,
      medical_record: createPrescriptionDto.medical_record_id ? 
        await this.medicalRecordRepository.findOne({ where: { id: createPrescriptionDto.medical_record_id } }) : 
        null,
    });

    const savedPrescription = await this.prescriptionRepository.save(prescription);
    if (!savedPrescription) {
      throw new Error('Tạo đơn thuốc thất bại');
    }

    return {
      message: 'Tạo đơn thuốc thành công',
      data: savedPrescription,
    };
  }

  // Get toàn bộ danh sách đơn thuốc
  async findAll() {
    const prescriptions = await this.prescriptionRepository.find({
      relations: ['patient', 'doctor', 'medical_record', 'details'],
    });
    if (!prescriptions || prescriptions.length === 0) {
      throw new NotFoundException('Chưa có đơn thuốc nào trong hệ thống');
    }
    return {
      message: 'Lấy danh sách đơn thuốc thành công',
      data: prescriptions,
    };
  }

  // Lấy thông tin đơn thuốc theo id
  async findOne(id: string) {
    const prescription = await this.prescriptionRepository.findOne({ 
      where: { id },
      relations: ['patient', 'doctor', 'medical_record', 'details'],
    });
    if (!prescription) {
      throw new NotFoundException(`Đơn thuốc với id: ${id} không tồn tại`);
    }
    return {
      message: 'Lấy thông tin đơn thuốc thành công',
      data: prescription,
    };
  }

  // Lấy đơn thuốc theo bệnh nhân
  async findByPatient(patientId: string) {
    const prescriptions = await this.prescriptionRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'doctor', 'medical_record', 'details'],
    });
    if (!prescriptions || prescriptions.length === 0) {
      throw new NotFoundException(`Không tìm thấy đơn thuốc nào cho bệnh nhân với id: ${patientId}`);
    }
    return {
      message: 'Lấy danh sách đơn thuốc theo bệnh nhân thành công',
      data: prescriptions,
    };
  }

  // Cập nhật thông tin đơn thuốc
  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto) {
    if (updatePrescriptionDto.total_fee !== undefined && updatePrescriptionDto.total_fee < 0) {
      throw new BadRequestException('Tổng phí không được âm');
    }

    const prescriptionToUpdate = await this.prescriptionRepository.findOne({ where: { id }, relations: ['patient', 'doctor', 'medical_record'] });
    if (!prescriptionToUpdate) throw new NotFoundException(`Đơn thuốc với id: ${id} không tồn tại`);

    // check patient tồn tại (nếu có)
    if (updatePrescriptionDto.patient_id) {
      const patient = await this.patientRepository.findOne({ 
        where: { id: updatePrescriptionDto.patient_id } 
      });
      if (!patient) {
        throw new NotFoundException(`Bệnh nhân với id: ${updatePrescriptionDto.patient_id} không tồn tại`);
      }
    }
    
    // check doctor tồn tại (nếu có)
    if (updatePrescriptionDto.doctor_id) {
      const doctor = await this.staffRepository.findOne({ 
        where: { id: updatePrescriptionDto.doctor_id } 
      });
      if (!doctor) {
        throw new NotFoundException(`Bác sĩ với id: ${updatePrescriptionDto.doctor_id} không tồn tại`);
      }
    }

    // check medical record tồn tại (nếu có)
    if (updatePrescriptionDto.medical_record_id) {
      const medicalRecord = await this.medicalRecordRepository.findOne({ 
        where: { id: updatePrescriptionDto.medical_record_id } 
      });
      if (!medicalRecord) {
        throw new NotFoundException(`Hồ sơ bệnh án với id: ${updatePrescriptionDto.medical_record_id} không tồn tại`);
      }
    }

    // cập nhật doctor + patient + medical record (nếu có)
    if (updatePrescriptionDto.patient_id) {
      const patient = await this.patientRepository.findOne({ 
        where: { id: updatePrescriptionDto.patient_id } 
      });
      if (patient) prescriptionToUpdate.patient = patient;
    }

    if (updatePrescriptionDto.doctor_id) {
      const doctor = await this.staffRepository.findOne({ 
        where: { id: updatePrescriptionDto.doctor_id } 
      });
      if (doctor) prescriptionToUpdate.doctor = doctor;
    }

    if (updatePrescriptionDto.medical_record_id) {
      const medicalRecord = await this.medicalRecordRepository.findOne({ 
        where: { id: updatePrescriptionDto.medical_record_id } 
      });
      if (medicalRecord) prescriptionToUpdate.medical_record = medicalRecord;
    }

    // Assign object để không bị lỗi không tìm được property trong entity
    Object.assign(prescriptionToUpdate, updatePrescriptionDto);
    
    const updatedPrescription = await this.prescriptionRepository.save(prescriptionToUpdate);
    
    return {
      message: 'Cập nhật đơn thuốc thành công',
      data: updatedPrescription,
    };
  }

  // Xóa đơn thuốc
  async remove(id: string) {
    const prescription = await this.prescriptionRepository.findOne({ where: { id } });
    if (!prescription) {
      throw new NotFoundException(`Đơn thuốc với id: ${id} không tồn tại`);
    }
    await this.prescriptionRepository.remove(prescription);
    return {
      message: 'Xóa đơn thuốc thành công',
      data: prescription,
    };
  }
}
