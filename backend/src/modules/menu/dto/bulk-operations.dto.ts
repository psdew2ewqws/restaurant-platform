import { IsArray, IsString, IsEnum, IsOptional } from 'class-validator';

export class BulkStatusUpdateDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsEnum([0, 1])
  status: number;
}

export class BulkDeleteDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}

export class CreateCategoryDto {
  @IsString()
  name: { en?: string; ar?: string };

  @IsOptional()
  @IsString()
  description?: { en?: string; ar?: string };

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}