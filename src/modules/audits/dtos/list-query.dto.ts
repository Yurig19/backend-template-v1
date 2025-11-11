import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

/**
 * Data transfer object for querying audit lists with pagination and search.
 */
export class ListAuditsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (default: 1)' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records per page (default: 10)',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  dataPerPage?: number = 10;

  @ApiPropertyOptional({
    example: 'search term',
    description: 'Filter audits by entity or method',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
