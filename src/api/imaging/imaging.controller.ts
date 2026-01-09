import {
    Controller,
    Post,
    Body,
    UseGuards,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    Req,
    Get,
    Param,
    Query,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ImagingService } from "./imaging.service";
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiConsumes,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/guards/roles.decorator";
import { CreateImageResultDto } from "./dto/create-image-result.dto";
import { QueryImagingResultDto } from "./dto/query-imaging-result.dto";
import { extname } from "path";

@ApiTags("imaging")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("api/v1/imaging")
export class ImagingController {
    constructor(private readonly imagingService: ImagingService) {}

    @Get("indications")
    @ApiOperation({
        summary: "Diagnostic doctor - list imaging indications to process",
    })
    @Roles("DOCTOR")
    async getIndications(@Req() req) {
        const userId = req.user.id;
        return this.imagingService.getIndicationsForDiagnosticDoctor(userId);
    }

    @Get("indications/:id")
    @ApiOperation({ summary: "Diagnostic doctor - indication detail" })
    @Roles("DOCTOR")
    async getIndicationDetail(@Req() req, @Param("id") id: string) {
        const userId = req.user.id;
        return this.imagingService.getIndicationDetail(userId, id);
    }

    @Post("xray-result")
    @ApiOperation({
        summary: "DIAGNOSTIC doctor uploads X-ray images and result",
    })
    @ApiConsumes("multipart/form-data")
    @Roles("DOCTOR")
    @UseInterceptors(
        FilesInterceptor("image_files", 10, {
            storage: diskStorage({
                destination: "./uploads/xray",
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + "-" + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    cb(new Error("Only image files are allowed!"), false);
                } else {
                    cb(null, true);
                }
            },
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
        })
    )
    async createXrayResult(
        @Req() req,
        @Body() dto: CreateImageResultDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        const doctorId = req.user.id;
        return this.imagingService.createXrayResult(doctorId, dto, files);
    }

    @Get("completed")
    @ApiOperation({
        summary: "Diagnostic doctor - get completed imaging results",
    })
    @Roles("DOCTOR")
    async getCompletedResults(@Req() req) {
        console.log("GET /api/v1/imaging/completed called");
        const userId = req.user.id;
        return this.imagingService.getCompletedResultsForDiagnosticDoctor(
            userId
        );
    }

    @Get("completed")
    @ApiOperation({
        summary:
            "Diagnostic doctor - get completed imaging results with filter & pagination",
    })
    @Roles("DOCTOR")
    async getCompletedResultsWithFilter(
        @Req() req,
        @Query() query: QueryImagingResultDto
    ) {
        const userId = req.user.id;
        return this.imagingService.getCompletedResultsWithFilter(query, userId);
    }

    @Get("patient/:patientId/results")
    @ApiOperation({ summary: "PATIENT views their X-ray results" })
    @Roles("PATIENT", "DOCTOR")
    async getPatientResults(@Param("patientId") patientId: string) {
        return this.imagingService.getResultsByPatient(patientId);
    }

    @Get("indication/:indicationId/results")
    @ApiOperation({
        summary: "CLINICAL doctor views X-ray results for an indication",
    })
    @Roles("DOCTOR")
    async getResultsByIndication(@Param("indicationId") indicationId: string) {
        return this.imagingService.getResultsByIndication(indicationId);
    }

    @Get("indications/today/pending")
    @ApiOperation({
        summary: "Diagnostic doctor - list today's pending imaging indications",
    })
    @Roles("DOCTOR")
    async getTodayPendingIndications(@Req() req) {
        const userId = req.user.id;
        return this.imagingService.getTodayPendingIndicationsForDiagnosticDoctor(
            userId
        );
    }
}
