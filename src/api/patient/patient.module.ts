import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../../shared/entities/patient.entity';
import { User } from '../../shared/entities/user.entity';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
    imports: [TypeOrmModule.forFeature([Patient, User])],
    providers: [PatientService, RolesGuard],
    controllers: [PatientController],
    exports: [PatientService],
})
export class PatientModule { }
