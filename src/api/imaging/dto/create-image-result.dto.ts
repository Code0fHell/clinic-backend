import { ApiProperty } from '@nestjs/swagger';

export class CreateImageResultDto {
  @ApiProperty()
  indication_id: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  image_file: any; // X-ray image file

  @ApiProperty({ required: false })
  result?: string;

  @ApiProperty({ required: false })
  conclusion?: string;
}