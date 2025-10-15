import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType } from '../../../shared/enums/room-type.enum';

export class UpdateRoomDto {
  @ApiPropertyOptional()
  room_name?: string;

  @ApiPropertyOptional({ enum: RoomType })
  room_type?: RoomType;

  @ApiPropertyOptional()
  floor?: number;
}