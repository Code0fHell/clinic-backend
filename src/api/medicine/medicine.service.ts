import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

  // 🩺 Tạo thuốc mới
  async create(createMedicineDto: CreateMedicineDto) {
    const { price, sale_price, import_price, stock } = createMedicineDto;

    // Nếu không có sale_price thì dùng price (tương thích ngược)
    const finalSalePrice = sale_price ?? price;
    if (finalSalePrice !== undefined && finalSalePrice < 0) {
      throw new BadRequestException('Giá bán thuốc không được âm');
    }

    // Kiểm tra giá nhập
    if (import_price !== undefined && import_price < 0) {
      throw new BadRequestException('Giá nhập thuốc không được âm');
    }

    // Kiểm tra tồn kho âm
    if (stock !== undefined && stock < 0)
      throw new BadRequestException('Số lượng tồn kho không được âm');

    // Tạo entity mới
    const medicine = this.medicineRepository.create({
      ...createMedicineDto,
      sale_price: finalSalePrice,
      price: finalSalePrice, // Giữ price để tương thích
    });

    const saved = await this.medicineRepository.save(medicine);
    if (!saved) throw new Error('Thêm thuốc thất bại');

    return {
      message: 'Tạo thuốc thành công',
      data: saved,
    };
  }

  //  Lấy danh sách thuốc
  async findAll(category?: string) {
    const queryBuilder = this.medicineRepository.createQueryBuilder('medicine');
    
    if (category && category.trim() !== '') {
      queryBuilder.where('medicine.category = :category', { category });
    }

    const medicines = await queryBuilder.getMany();
    if (!medicines.length)
      throw new NotFoundException('Chưa có thuốc nào trong hệ thống');
    return {
      message: 'Lấy danh sách thuốc thành công',
      data: medicines,
    };
  }

  //  Lấy chi tiết thuốc
  async findOne(id: string) {
    const medicine = await this.medicineRepository.findOne({ where: { id } });
    if (!medicine)
      throw new NotFoundException(`Không tìm thấy thuốc có id: ${id}`);
    return {
      message: 'Lấy thông tin thuốc thành công',
      data: medicine,
    };
  }

  // Cập nhật thuốc
  async update(id: string, updateMedicineDto: UpdateMedicineDto) {
    const existing = await this.medicineRepository.findOne({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Không tìm thấy thuốc có id: ${id}`);

    const { price, sale_price, import_price } = updateMedicineDto;

    // Xử lý giá bán
    if (sale_price !== undefined && sale_price < 0) {
      throw new BadRequestException('Giá bán thuốc không được âm');
    }
    if (price !== undefined && price < 0) {
      throw new BadRequestException('Giá thuốc không được âm');
    }

    // Nếu có sale_price thì dùng sale_price, không thì dùng price
    if (sale_price !== undefined) {
      (updateMedicineDto as any).price = sale_price; // Cập nhật price để tương thích
    } else if (price !== undefined) {
      (updateMedicineDto as any).sale_price = price; // Cập nhật sale_price nếu chỉ có price
    }

    // Kiểm tra giá nhập
    if (import_price !== undefined && import_price < 0) {
      throw new BadRequestException('Giá nhập thuốc không được âm');
    }

    if (updateMedicineDto.stock !== undefined && updateMedicineDto.stock < 0)
      throw new BadRequestException('Số lượng tồn kho không được âm');

    if (updateMedicineDto.expiry_date) {
      const parsed = new Date(updateMedicineDto.expiry_date);
      if (isNaN(parsed.getTime()))
        throw new BadRequestException('Ngày hết hạn không hợp lệ');
      (updateMedicineDto as any).expiry_date = parsed;
    }

    await this.medicineRepository.update(id, updateMedicineDto);
    const updated = await this.medicineRepository.findOne({ where: { id } });

    return {
      message: 'Cập nhật thuốc thành công',
      data: updated,
    };
  }

  // Xóa thuốc
  async remove(id: string) {
    const medicine = await this.medicineRepository.findOne({ where: { id } });
    if (!medicine)
      throw new NotFoundException(`Không tìm thấy thuốc có id: ${id}`);
    await this.medicineRepository.remove(medicine);
    return {
      message: 'Xóa thuốc thành công',
      data: medicine,
    };
  }

  // 🔎 Tìm kiếm thuốc theo tên hoặc mô tả
  async searchByNameOrDescription(q: string) {
    if (!q || q.trim() === '') {
      throw new BadRequestException('Từ khóa tìm kiếm không được để trống');
    }

    const result = await this.medicineRepository.find({
      where: [
        { name: Like(`%${q}%`) },
        { description: Like(`%${q}%`) },
      ],
      take: 10,
    });

    if (!result.length) {
      return {
        message: `Không tìm thấy thuốc với từ khóa "${q}"`,
        data: [],
      };
    }

    return {
      message: `Kết quả tìm kiếm với từ khóa "${q}"`,
      data: result,
    };
  }

}
