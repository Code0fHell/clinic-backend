import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../shared/enums/gender.enum';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  full_name?: string;

  @ApiProperty({ required: false })
  date_of_birth?: Date;

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  phone?: string;
}