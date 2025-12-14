import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabTestResult } from '../../shared/entities/lab-test-result.entity';
import { IndicationTicket } from '../../shared/entities/indication-ticket.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Patient } from '../../shared/entities/patient.entity';
import { ServiceIndication } from '../../shared/entities/service-indication.entity';
import { Repository, Between } from 'typeorm';
import { CreateLabTestResultDto } from './dto/create-lab-test-result.dto';
import { DoctorType } from 'src/shared/enums/doctor-type.enum';

@Injectable()
export class LabTestResultService {
  constructor(
    @InjectRepository(LabTestResult)
    private readonly labTestResultRepository: Repository<LabTestResult>,
    @InjectRepository(IndicationTicket)
    private readonly indicationTicketRepository: Repository<IndicationTicket>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(ServiceIndication)
    private readonly serviceIndicationRepository: Repository<ServiceIndication>,
  ) {}

  private generateShortCode(length = 4) {
    return Array.from({ length })
      .map(() => Math.floor(Math.random() * 36).toString(36).toUpperCase())
      .join('');
  }

  // Tạo barcode ngắn: LAB-YYYYMMDD-XXXX
  async generateUniqueBarcode(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    let barcode: string;
    let exists: LabTestResult | null;

    do {
      const randomCode = this.generateShortCode(4); // 4 ký tự
      barcode = `LAB-${dateStr}-${randomCode}`;

      exists = await this.labTestResultRepository.findOne({
        where: { barcode },
      });
    } while (exists);

    return barcode;
  }

  async createLabTestResult(userId: string, dto: CreateLabTestResultDto) {
    // Kiểm tra nhân viên là LAB
    const labStaff = await this.staffRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!labStaff || labStaff.doctor_type !== DoctorType.LAB) {
      throw new ForbiddenException('Only lab staff can create lab test results');
    }

    // Kiểm tra indication ticket tồn tại
    const indication = await this.indicationTicketRepository.findOne({
      where: { id: dto.indication_id },
      relations: ['patient', 'doctor', 'serviceItems', 'serviceItems.medical_service'],
    });
    if (!indication) throw new NotFoundException('Indication ticket not found');

    // Kiểm tra patient tồn tại
    const patient = await this.patientRepository.findOne({
      where: { id: dto.patient_id },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // Validate service_results
    if (!dto.service_results || dto.service_results.length === 0) {
      throw new BadRequestException('Service results are required');
    }

    // Cập nhật test_result cho từng service-indication
    const updatedServices: Array<{
      service_indication_id: string;
      service_name: string;
      test_result: number;
      reference_value: number;
    }> = [];
    
    for (const serviceResult of dto.service_results) {
      const serviceIndication = await this.serviceIndicationRepository.findOne({
        where: { id: serviceResult.service_indication_id },
        relations: ['medical_service', 'indication'],
      });

      if (!serviceIndication) {
        throw new NotFoundException(
          `Service indication ${serviceResult.service_indication_id} not found`
        );
      }

      // Kiểm tra service indication thuộc về indication ticket này
      if (serviceIndication.indication.id !== dto.indication_id) {
        throw new BadRequestException(
          'Service indication does not belong to this indication ticket'
        );
      }

      // Cập nhật test_result
      serviceIndication.test_result = serviceResult.test_result;
      await this.serviceIndicationRepository.save(serviceIndication);

      updatedServices.push({
        service_indication_id: serviceIndication.id,
        service_name: serviceIndication.medical_service.service_name,
        test_result: serviceResult.test_result,
        reference_value: serviceIndication.medical_service.reference_value,
      });
    }

    // Tạo barcode unique
    const barcode = await this.generateUniqueBarcode();

    // Tạo summary result từ service_results
    const resultSummary = updatedServices
      .map((service) => {
        return `${service.service_name}: ${service.test_result}${
          service.reference_value ? ' (Tham chiếu: ' + service.reference_value + ')' : ''
        }`;
      })
      .join('\n');

    // Tạo kết quả xét nghiệm
    const labTestResult = this.labTestResultRepository.create({
      indication,
      doctor: labStaff,
      patient,
      barcode,
      result: resultSummary,
      conclusion: dto.conclusion,
    });

    await this.labTestResultRepository.save(labTestResult);

    return {
      message: 'Lab test result created successfully',
      labTestResultId: labTestResult.id,
      barcode: labTestResult.barcode,
      indication_id: indication.id,
      patient_id: patient.id,
      patient_name: patient.patient_full_name,
      lab_staff_id: labStaff.id,
      lab_staff_name: labStaff.user.full_name,
      service_results: updatedServices,
      conclusion: labTestResult.conclusion,
      created_at: labTestResult.created_at,
    };
  }

  async getResultsByPatient(patientId: string) {
    // Kiểm tra patient tồn tại
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.labTestResultRepository.find({
      where: { patient: { id: patientId } },
      relations: ['indication', 'doctor', 'doctor.user'],
      order: { created_at: 'DESC' },
    });
  }

  async getResultsByIndication(indicationId: string) {
    // Kiểm tra indication ticket tồn tại
    const indication = await this.indicationTicketRepository.findOne({
      where: { id: indicationId },
    });
    if (!indication) throw new NotFoundException('Indication ticket not found');

    return this.labTestResultRepository.find({
      where: { indication: { id: indicationId } },
      relations: ['patient', 'doctor', 'doctor.user'],
      order: { created_at: 'DESC' },
    });
  }

  async getTodayCompletedResults() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const results = await this.labTestResultRepository.find({
      where: {
        created_at: Between(startOfDay, endOfDay),
      },
      relations: [
        'patient',
        'doctor',
        'doctor.user',
        'indication',
        'indication.serviceItems',
        'indication.serviceItems.medical_service',
      ],
      order: {
        created_at: 'DESC',
      },
    });

    return results.map(result => ({
      id: result.id,
      barcode: result.barcode,
      indication: {
        id: result.indication.id,
        barcode: result.indication.barcode,
        diagnosis: result.indication.diagnosis,
        indication_date: result.indication.indication_date,
      },
      patient: {
        id: result.patient.id,
        patient_full_name: result.patient.patient_full_name,
        patient_dob: result.patient.patient_dob,
        patient_phone: result.patient.patient_phone,
        patient_address: result.patient.patient_address,
        patient_gender: result.patient.patient_gender,
      },
      doctor: {
        id: result.doctor.id,
        user: {
          full_name: result.doctor.user.full_name,
        },
      },
      testResults: result.indication.serviceItems.map(item => ({
        serviceName: item.medical_service.service_name,
        result: item.test_result,
        referenceValue: item.medical_service.reference_value,
      })),
      conclusion: result.conclusion,
      created_at: result.created_at,
    }));
  }
}

