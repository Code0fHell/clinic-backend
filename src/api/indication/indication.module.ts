import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { IndicationController } from "./indication.controller";
import { IndicationService } from "./indication.service";
import { IndicationTicket } from "src/shared/entities/indication-ticket.entity"
import { RolesGuard } from "src/common/guards/roles.guard";
import { MedicalService } from "src/shared/entities/medical-service.entity";
import { ServiceIndication } from "src/shared/entities/service-indication.entity";
import { MedicalTicket } from "src/shared/entities/medical-ticket.entity";
import { Staff } from "src/shared/entities/staff.entity";
import { Patient } from "src/shared/entities/patient.entity";

@Module({
    imports: [TypeOrmModule.forFeature([IndicationTicket, MedicalService, ServiceIndication, MedicalTicket, Patient, Staff ])],
    providers: [IndicationService, RolesGuard],
    controllers: [IndicationController],
    exports: [IndicationService],
})
export class IndicationModule { }