import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalTicket } from '../../shared/entities/medical-ticket.entity';
import { Visit } from '../../shared/entities/visit.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Patient } from '../../shared/entities/patient.entity';
import { User } from '../../shared/entities/user.entity';
import { MedicalTicketService } from './medical-ticket.service';
import { MedicalTicketController } from './medical-ticket.controller';

import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([MedicalTicket, Visit, Staff, Patient, User]), // inject các entity cần dùng
        // AuthModule, // cần xác thực JWT
    ],
    controllers: [MedicalTicketController],
    providers: [MedicalTicketService, RolesGuard],
    exports: [MedicalTicketService], // để module khác có thể dùng
})
export class MedicalTicketModule { }
