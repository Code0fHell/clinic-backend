import { Module } from '@nestjs/common';
import { MedicineController } from './medicine.controller';
import { MedicineService } from './medicine.service';
import { Medicine } from 'src/shared/entities/medicine.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine])],
  controllers: [MedicineController],
  providers: [MedicineService],
})
export class MedicineModule {}
