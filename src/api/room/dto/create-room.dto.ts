import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '../../../shared/enums/room-type.enum';

export class CreateRoomDto {
  @ApiProperty()
  room_name: string;

  @ApiProperty({ enum: RoomType })
  room_type: RoomType;

  @ApiProperty({ required: false })
  floor?: number;
}