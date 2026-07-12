import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TrackEventDto } from './track-event.dto';

export class TrackEventsBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackEventDto)
  events!: TrackEventDto[];
}
