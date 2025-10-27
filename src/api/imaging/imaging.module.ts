import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageResult } from "src/shared/entities/image-result.entity";
import { ImagingService } from "./imaging.service";
import { ImagingController } from "./imaging.controller";
import { IndicationTicket } from "src/shared/entities/indication-ticket.entity";
import { Staff } from "src/shared/entities/staff.entity";
import { Patient } from "src/shared/entities/patient.entity";

@Module ({
    imports: [TypeOrmModule.forFeature([ImageResult, IndicationTicket, Staff, Patient])],
    providers: [ImagingService],
    controllers: [ImagingController],
    exports: [ImagingService]
})
export class ImagingModule {}