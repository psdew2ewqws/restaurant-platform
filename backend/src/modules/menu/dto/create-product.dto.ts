import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsDecimal, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class LocalizedTextDto {
  @IsOptional()
  @IsString()
  en?: string;

  @IsOptional()  
  @IsString()
  ar?: string;
}

export class PricingDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  website?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  uber_eats?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  doordash?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  talabat?: number;
}

export class CreateProductDto {
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name: LocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  basePrice: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  cost?: number;

  @ValidateNested()
  @Type(() => PricingDto)
  pricing: PricingDto;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  preparationTime?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  priority?: number;

  @IsOptional()
  @IsEnum([0, 1])
  @Transform(({ value }) => parseInt(value))
  status?: number;

  @IsOptional()
  @IsString()
  companyId?: string;
}