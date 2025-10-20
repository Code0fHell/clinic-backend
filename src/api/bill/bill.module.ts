import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Bill } from "src/shared/entities/bill.entity";
import { Patient } from "src/shared/entities/patient.entity";
import { Staff } from "src/shared/entities/staff.entity";
import { MedicalTicket } from "src/shared/entities/medical-ticket.entity";
import { IndicationTicket } from "src/shared/entities/indication-ticket.entity";
import { Prescription } from "src/shared/entities/prescription.entity";
import { BillController } from "./bill.controller";
import { BillService } from "./bill.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Bill,
            Patient,
            Staff,
            MedicalTicket,
            IndicationTicket,
            Prescription,
        ]),
    ],
    providers: [BillService, RolesGuard],
    controllers: [BillController],
    exports: [BillService],
})
export class BillModule {}
