import { IsArray, ValidateNested, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class SectionOrderItem {
  @IsString()
  id!: string;

  @IsNumber()
  sortOrder!: number;

  @IsBoolean()
  isActive!: boolean;
}

export class BatchUpdateSectionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionOrderItem)
  sections!: SectionOrderItem[];
}
