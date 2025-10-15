import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from "src/shared/entities/room.entity";
import { MedicalServiceController } from "./medical-service.controller";
import { MedicalServiceService } from "./medical-service.service";
import { MedicalService } from 'src/shared/entities/medical-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalService, Room])],
  providers: [MedicalServiceService],
  controllers: [MedicalServiceController],
  exports: [MedicalServiceService],
})
export class MedicalServiceModule {}