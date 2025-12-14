import { TypeOrmModule } from "@nestjs/typeorm";
import { Module, forwardRef } from "@nestjs/common";
import { IndicationController } from "./indication.controller";
import { IndicationService } from "./indication.service";
import { IndicationTicket } from "src/shared/entities/indication-ticket.entity";
import { RolesGuard } from "src/common/guards/roles.guard";
import { MedicalService } from "src/shared/entities/medical-service.entity";
import { ServiceIndication } from "src/shared/entities/service-indication.entity";
import { MedicalTicket } from "src/shared/entities/medical-ticket.entity";
import { Staff } from "src/shared/entities/staff.entity";
import { Patient } from "src/shared/entities/patient.entity";
import { MedicalRecord } from "src/shared/entities/medical-record.entity";
import { NotificationModule } from "../notification/notification.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            IndicationTicket,
            MedicalService,
            ServiceIndication,
            MedicalTicket,
            Patient,
            Staff,
            MedicalRecord,
        ]),
        forwardRef(() => NotificationModule),
    ],
    providers: [IndicationService, RolesGuard],
    controllers: [IndicationController],
    exports: [IndicationService],
})
export class IndicationModule {}
