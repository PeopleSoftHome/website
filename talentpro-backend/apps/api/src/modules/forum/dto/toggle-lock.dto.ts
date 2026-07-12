import { IsBoolean } from 'class-validator';

export class ToggleLockDto {
  @IsBoolean()
  isLocked!: boolean;
}
