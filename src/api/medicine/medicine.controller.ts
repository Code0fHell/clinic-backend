import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Roles } from 'src/common/guards/roles.decorator';

@ApiTags('medicine')
@Controller('api/v1/medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search medicines by name or description' })
  findByNameorDescription(@Query('q') q: string) {
    return this.medicineService.searchByNameOrDescription(q);
  }
  
  @Post()
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PHARMACIST, UserRole.OWNER)
  @ApiResponse({ status: 201, description: 'The medicine has been successfully created.' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicineService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines' })
  findAll() {
    return this.medicineService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medicine by ID' })
  findOne(@Param('id') id: string) {
    return this.medicineService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a medicine by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PHARMACIST, UserRole.OWNER)
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicineService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a medicine by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PHARMACIST, UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.medicineService.remove(id);
  }
}
