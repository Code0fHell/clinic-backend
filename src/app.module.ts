import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./api/auth/auth.module";
import { StaffModule } from "./api/staff/staff.module";
import { UserModule } from "./api/user/user.module";
import { MedicalTicketModule } from "./api/medical-ticket/medical-ticket.module";
import { PatientModule } from "./api/patient/patient.module";
import { VisitModule } from "./api/visit/visit.module";
import { AppointmentModule } from "./api/appointment/appointment.module";
import { WorkScheduleModule } from "./api/work-schedule/work-schedule.module";
import { RoomModule } from "./api/room/room.module";
import { MedicalServiceModule } from "./api/medical-service/medical-service.module";
import { MedicineModule } from './api/medicine/medicine.module';
import { IndicationModule } from "./api/indication/indication.module";
import { BillModule } from "./api/bill/bill.module";
import { ImagingModule } from "./api/imaging/imaging.module";
import { PaymentModule } from "./api/payment/payment.module";
import { MedicalRecordModule } from "./api/medical-record/medical-record.module";
import { PrescriptionModule } from "./api/prescription/prescription.module";
import { PrescriptionDetailModule } from "./api/prescription-detail/prescription-detail.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cs: ConfigService) => ({
                type: "mysql",
                host: cs.get("DB_HOST"),
                port: +cs.get("DB_PORT"),
                username: cs.get("DB_USER"),
                password: cs.get("DB_PASS"),
                database: cs.get("DB_NAME"),
                entities: [__dirname + "/**/*.entity{.ts,.js}"],
                synchronize: false,
                logging: cs.get("DB_LOG") === "true",
                charset: "utf8mb4_general_ci",
                timezone: "Z",
                extra: {
                    connectionLimit: +cs.get("DB_CONNECTION_LIMIT") || 10,
                },
            }),
        }),
        AuthModule,
        StaffModule,
        UserModule,
        MedicalTicketModule,
        PatientModule,
        VisitModule,
        AppointmentModule,
        WorkScheduleModule,
        RoomModule,
        MedicalServiceModule,
        MedicineModule,
        IndicationModule,
        BillModule,
        ImagingModule,
        PaymentModule,
        MedicalRecordModule,
        PrescriptionModule,
        PrescriptionDetailModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
