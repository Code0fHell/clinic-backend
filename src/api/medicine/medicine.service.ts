import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { Medicine } from '../../shared/entities/medicine.entity';

@Injectable()
export class MedicineService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
  ) { }

  // Tạo thuốc mới, check giá âm thì báo lỗi bad request 
  async create(createMedicineDto: CreateMedicineDto) {
    if (createMedicineDto.price < 0) {
      throw new BadRequestException('Giá thuốc không được âm');
    }
    const medicine = this.medicineRepository.create(createMedicineDto);
    const savedMedicine = await this.medicineRepository.save(medicine);
    if (!savedMedicine) {
      throw new Error('Thêm thuốc thất bại');
    }
    return {
      message: 'Tạo thuốc thành công',
      data: savedMedicine,
    };
  }

  // Get toàn bộ danh sách thuốc trong hệ thống
  async findAll() {
    const medicines = await this.medicineRepository.find();
    if (!medicines || medicines.length === 0) {
      throw new NotFoundException('Chưa có thuốc nào trong hệ thống');
    }
    return {
      message: 'Lấy danh sách thuốc thành công',
      data: medicines,
    };
  }

  // Lấy thông tin thuốc theo id
  async findOne(id: string) {
    const medicine = await this.medicineRepository.findOne({ where: { id } });
    if (!medicine) {
      throw new NotFoundException(`Sản phẩm thuốc với id: ${id} không tồn tại`);
    }
    return {
      message: 'Lấy thông tin thuốc thành công',
      data: medicine,
    };
  }

  // Cập nhật thông tin thuốc, check price âm
  async update(id: string, updateMedicineDto: UpdateMedicineDto) {
    if (updateMedicineDto.price !== undefined && updateMedicineDto.price < 0) {
      throw new BadRequestException('Giá thuốc không được âm');
    }

    const medicine = await this.findOne(id);
    if (!medicine) {
      throw new NotFoundException(`Sản phẩm thuốc với id: ${id} không tồn tại`);
    }

    const isMedicineUpdated = await this.medicineRepository.update(id, updateMedicineDto);
    if (isMedicineUpdated.affected === 0) {
      throw new Error('Cập nhật thuốc thất bại');
    }
    const updatedMedicine = await this.findOne(id);
    return {
      message: 'Cập nhật thuốc thành công',
      data: updatedMedicine,
    };
  }

  async remove(id: string) {
    const medicine = await this.medicineRepository.findOne({ where: { id } });
    if (!medicine) {
      throw new NotFoundException(`Sản phẩm thuốc với id: ${id} không tồn tại`);
    }
    await this.medicineRepository.remove(medicine);
    return {
      message: 'Xóa thuốc thành công',
      data: medicine,
    }
  }
  // Tìm kiếm thuốc theo tên
  async searchByName(q: string) {
    return this.medicineRepository.find({
      where: { name: Like(`%${q}%`) },
      take: 10,
    });
  }
}
