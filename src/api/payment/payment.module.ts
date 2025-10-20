import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../shared/entities/payment.entity';
import { Bill } from '../../shared/entities/bill.entity';
import { User } from '../../shared/entities/user.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Patient } from 'src/shared/entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Bill, User, Patient])],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}