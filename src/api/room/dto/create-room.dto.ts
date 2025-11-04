import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min, IsNotEmpty } from 'class-validator';
import { RoomType } from '../../../shared/enums/room-type.enum';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Tên phòng (ví dụ: Phòng khám 101, Phòng X-quang 2, v.v.)',
    example: 'Phòng khám nội tổng quát',
  })
  @IsString({ message: 'room_name phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'room_name không được để trống' })
  room_name: string;

  @ApiProperty({
    description: 'Loại phòng (CLINICAL, TEST, IMAGING, PHARMACY, ADMIN, ...)',
    enum: RoomType,
    example: 'CLINICAL',
  })
  @IsEnum(RoomType, { message: 'room_type không hợp lệ' })
  room_type: RoomType;

  @ApiProperty({
    description: 'Tầng đặt phòng (tùy chọn)',
    required: false,
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'floor phải là số nguyên' })
  @Min(0, { message: 'floor không thể nhỏ hơn 0' })
  floor?: number;
}
