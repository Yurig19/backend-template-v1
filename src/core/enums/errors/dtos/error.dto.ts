import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    type: Number,
    description: 'HTTP status code of the error',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    type: String,
    description: 'Error message providing more context about the failure',
    example: 'Bad Request',
  })
  message: string;

  @ApiProperty({
    type: String,
    description: 'Short description of the HTTP error type',
    example: 'Bad Request',
  })
  error: string;
}
