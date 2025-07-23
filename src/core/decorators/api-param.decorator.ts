import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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

type EnumType = Record<string, string | number>;

interface ParamOptions {
  type: AllowedTypes | EnumType;
  required?: boolean;
  description?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  example?: any;
  enumName?: string;
  isUuid?: boolean;
}

function normalizeType(type: AllowedTypes | EnumType): AllowedTypes | EnumType {
  if (typeof type === 'function') {
    switch (type) {
      case String:
        return 'string';
      case Number:
        return 'number';
      case Boolean:
        return 'boolean';
      case Array:
        return 'array';
      case Object:
        return 'object';
      default:
        return type;
    }
  }
  return type;
}

export function ApiParamDecorator(options: ParamOptions) {
  let { type, required, description, example, isUuid } = options;

  const isEnumType = isEnum(type);

  if (!isEnumType) {
    type = normalizeType(type) as AllowedTypes;
  }
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

  if (isEnumType && typeof type === 'object') {
    decorators.push(IsEnum(type));
  } else if (isUuid) {
    decorators.push(IsUUID());
  } else {
    const validationDecorator = getValidationDecorator(type as AllowedTypes);
    if (validationDecorator) {
      decorators.push(validationDecorator);
    }
  }

  return applyDecorators(...decorators);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function isEnum(value: any): value is EnumType {
  return typeof value === 'object' && !Array.isArray(value);
}

function getValidationDecorator(type: AllowedTypes) {
  switch (type) {
    case 'string':
      return IsString();
    case 'number':
    case 'integer':
      return IsNumber();
    case 'boolean':
      return IsBoolean();
    case 'array':
      return IsArray();
    case 'object':
      return IsObject();
    default:
      return null;
  }
}
