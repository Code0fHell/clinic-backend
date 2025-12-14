import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageResult } from "src/shared/entities/image-result.entity";
import { ImagingService } from "./imaging.service";
import { ImagingController } from "./imaging.controller";
import { IndicationTicket } from "src/shared/entities/indication-ticket.entity";
import { Staff } from "src/shared/entities/staff.entity";
import { Patient } from "src/shared/entities/patient.entity";
import { ServiceIndication } from "src/shared/entities/service-indication.entity";

@Module ({
    imports: [TypeOrmModule.forFeature([ImageResult, IndicationTicket, Staff, Patient, ServiceIndication])],
    providers: [ImagingService],
    controllers: [ImagingController],
    exports: [ImagingService]
})
export class ImagingModule {}