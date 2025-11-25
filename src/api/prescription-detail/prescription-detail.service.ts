import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePrescriptionDetailDto } from './dto/create-prescription-detail.dto';
import { UpdatePrescriptionDetailDto } from './dto/update-prescription-detail.dto';
import { PrescriptionDetail } from '../../shared/entities/prescription-detail.entity';
import { Prescription } from '../../shared/entities/prescription.entity';
import { Medicine } from '../../shared/entities/medicine.entity';

@Injectable()
export class PrescriptionDetailService {
  constructor(
    @InjectRepository(PrescriptionDetail)
    private readonly prescriptionDetailRepository: Repository<PrescriptionDetail>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
  ) {}

  // Tạo chi tiết đơn thuốc mới
  async create(createPrescriptionDetailDto: CreatePrescriptionDetailDto) {
    // Validate quantity
    if (createPrescriptionDetailDto.quantity <= 0) {
      throw new BadRequestException('Số lượng thuốc phải lớn hơn 0');
    }

    // Check prescription tồn tại
    const prescription = await this.prescriptionRepository.findOne({ 
      where: { id: createPrescriptionDetailDto.prescription_id } 
    });
    if (!prescription) {
      throw new NotFoundException(`Đơn thuốc với id: ${createPrescriptionDetailDto.prescription_id} không tồn tại`);
    }

    // Check medicine tồn tại
    const medicine = await this.medicineRepository.findOne({ 
      where: { id: createPrescriptionDetailDto.medicine_id } 
    });
    if (!medicine) {
      throw new NotFoundException(`Thuốc với id: ${createPrescriptionDetailDto.medicine_id} không tồn tại`);
    }

    // Tạo chi tiết đơn thuốc mới
    const prescriptionDetail = this.prescriptionDetailRepository.create({
      ...createPrescriptionDetailDto,
      prescription,
      medicine,
    });

    const savedPrescriptionDetail = await this.prescriptionDetailRepository.save(prescriptionDetail);
    if (!savedPrescriptionDetail) {
      throw new Error('Tạo chi tiết đơn thuốc thất bại');
    }
    // --- Update prescription total_fee ---
    const details = await this.prescriptionDetailRepository.find({
      where: { prescription: { id: prescription.id } },
      relations: ['medicine'],
    });
    const totalFee = details.reduce(
      (sum, d) => sum + Number(d.medicine.price || 0) * d.quantity,
      0,
    );
    prescription.total_fee = totalFee;
    await this.prescriptionRepository.save(prescription);

    return {
      message: 'Tạo chi tiết đơn thuốc thành công',
      data: savedPrescriptionDetail,
    };
  }

  // Get toàn bộ danh sách chi tiết đơn thuốc
  async findAll() {
    const prescriptionDetails = await this.prescriptionDetailRepository.find({
      relations: ['prescription', 'medicine'],
    });
    if (!prescriptionDetails || prescriptionDetails.length === 0) {
      throw new NotFoundException('Chưa có chi tiết đơn thuốc nào trong hệ thống');
    }
    return {
      message: 'Lấy danh sách chi tiết đơn thuốc thành công',
      data: prescriptionDetails,
    };
  }

  // Lấy thông tin chi tiết đơn thuốc theo id
  async findOne(id: string) {
    const prescriptionDetail = await this.prescriptionDetailRepository.findOne({ 
      where: { id },
      relations: ['prescription', 'medicine'],
    });
    if (!prescriptionDetail) {
      throw new NotFoundException(`Chi tiết đơn thuốc với id: ${id} không tồn tại`);
    }
    return {
      message: 'Lấy thông tin chi tiết đơn thuốc thành công',
      data: prescriptionDetail,
    };
  }

  // Lấy danh sách chi tiết đơn thuốc theo prescription id
  async findByPrescription(prescriptionId: string) {
    const prescriptionDetails = await this.prescriptionDetailRepository.find({
      where: { prescription: { id: prescriptionId } },
      relations: ['prescription', 'medicine'],
    });
    if (!prescriptionDetails || prescriptionDetails.length === 0) {
      throw new NotFoundException(`Không tìm thấy chi tiết đơn thuốc nào cho đơn thuốc với id: ${prescriptionId}`);
    }
    return {
      message: 'Lấy danh sách chi tiết đơn thuốc theo đơn thuốc thành công',
      data: prescriptionDetails,
    };
  }

  // Cập nhật thông tin chi tiết đơn thuốc
  async update(id: string, updatePrescriptionDetailDto: UpdatePrescriptionDetailDto) {
    if (updatePrescriptionDetailDto.quantity !== undefined && updatePrescriptionDetailDto.quantity <= 0) {
      throw new BadRequestException('Số lượng thuốc phải lớn hơn 0');
    }

    const prescriptionDetailToUpdate = await this.prescriptionDetailRepository.findOne({ 
      where: { id }, 
      relations: ['prescription', 'medicine'] 
    });
    if (!prescriptionDetailToUpdate) {
      throw new NotFoundException(`Chi tiết đơn thuốc với id: ${id} không tồn tại`);
    }

    // Check prescription tồn tại (nếu có)
    if (updatePrescriptionDetailDto.prescription_id) {
      const prescription = await this.prescriptionRepository.findOne({ 
        where: { id: updatePrescriptionDetailDto.prescription_id } 
      });
      if (!prescription) {
        throw new NotFoundException(`Đơn thuốc với id: ${updatePrescriptionDetailDto.prescription_id} không tồn tại`);
      }
    }
    
    // Check medicine tồn tại (nếu có)
    if (updatePrescriptionDetailDto.medicine_id) {
      const medicine = await this.medicineRepository.findOne({ 
        where: { id: updatePrescriptionDetailDto.medicine_id } 
      });
      if (!medicine) {
        throw new NotFoundException(`Thuốc với id: ${updatePrescriptionDetailDto.medicine_id} không tồn tại`);
      }
    }

    // Cập nhật prescription + medicine (nếu có)
    if (updatePrescriptionDetailDto.prescription_id) {
      const prescription = await this.prescriptionRepository.findOne({ 
        where: { id: updatePrescriptionDetailDto.prescription_id } 
      });
      if (prescription) prescriptionDetailToUpdate.prescription = prescription;
    }

    if (updatePrescriptionDetailDto.medicine_id) {
      const medicine = await this.medicineRepository.findOne({ 
        where: { id: updatePrescriptionDetailDto.medicine_id } 
      });
      if (medicine) prescriptionDetailToUpdate.medicine = medicine;
    }

    // Assign object để không bị lỗi không tìm được property trong entity
    Object.assign(prescriptionDetailToUpdate, updatePrescriptionDetailDto);
    
    const updatedPrescriptionDetail = await this.prescriptionDetailRepository.save(prescriptionDetailToUpdate);
    
    return {
      message: 'Cập nhật chi tiết đơn thuốc thành công',
      data: updatedPrescriptionDetail,
    };
  }

  // Xóa chi tiết đơn thuốc
  async remove(id: string) {
    const prescriptionDetail = await this.prescriptionDetailRepository.findOne({ where: { id } });
    if (!prescriptionDetail) {
      throw new NotFoundException(`Chi tiết đơn thuốc với id: ${id} không tồn tại`);
    }
    await this.prescriptionDetailRepository.remove(prescriptionDetail);
    return {
      message: 'Xóa chi tiết đơn thuốc thành công',
      data: prescriptionDetail,
    };
  }
}
