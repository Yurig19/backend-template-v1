import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

type AllowedTypes =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'integer'
  | 'null'
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  | Function
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  | Object
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  | Record<string, any>;

interface ParamOptions {
  type: AllowedTypes | EnumType;
  required?: boolean;
  description?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  example?: any;
  enumName?: string;
}

type EnumType = Record<string, string | number>;

export function ApiParamDecorator(options: ParamOptions) {
  const { type, required, description, example } = options;

  const isEnumType = isEnum(type);
  const apiPropertyOptions: ApiPropertyOptions = {
    type: isEnumType ? 'string' : type,
    enum: isEnumType ? Object.values(type) : undefined,
    required: required ?? true,
    description: description ?? 'No description provided',
    example,
    enumName: isEnumType && options.enumName ? options.enumName : undefined,
  };

  const decorators = [ApiProperty(apiPropertyOptions)];

  if (required === false) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  return applyDecorators(...decorators);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function isEnum(value: any): value is EnumType {
  return typeof value === 'object' && !Array.isArray(value);
}
