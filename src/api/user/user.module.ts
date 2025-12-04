import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../shared/entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Patient } from 'src/shared/entities/patient.entity';
import { LoadPatientInterceptor } from 'src/common/interceptors/load-patient.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([User, Patient])],
  providers: [UserService, LoadPatientInterceptor],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
