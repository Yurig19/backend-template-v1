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
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor
  | DateConstructor
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  | Function
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

export function ApiParamDecorator(opts: ParamOptions) {
  const {
    type,
    required = true,
    description,
    example,
    isUuid,
    enumName,
  } = opts;
  const isEnumType = isEnum(type);

  // let swaggerType: any;
  // if (isEnumType || type === String) {
  //   swaggerType = 'string';
  // } else if (type === Number) {
  //   swaggerType = 'number';
  // } else if (type === Boolean) {
  //   swaggerType = 'boolean';
  // } else if (type === Date) {
  //   swaggerType = 'string';
  // } else if (type === Array) {
  //   swaggerType = 'array';
  // } else if (type === Object) {
  //   swaggerType = 'object';
  // } else {
  //   swaggerType = 'string';
  // }

  const apiPropertyOptions: ApiPropertyOptions = {
    required,
    description: description ?? 'No description provided',
    example,
    ...(isEnumType
      ? {
          enum: Object.values(type as EnumType),
          enumName,
        }
      : type === Date
        ? {
            type: String,
            format: 'date-time',
          }
        : {
            type: () => type as AllowedTypes,
          }),
  };

  const decorators = [ApiProperty(apiPropertyOptions)];
  if (type === Date) {
    apiPropertyOptions.format = 'date-time';
  }

  if (!required) {
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

  console.log('[ApiParamDecorator] apiPropertyOptions:', apiPropertyOptions);
  return applyDecorators(...decorators);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function isEnum(value: any): value is EnumType {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (v) => typeof v === 'string' || typeof v === 'number'
    )
  );
}

function getValidationDecorator(type: AllowedTypes) {
  switch (type) {
    case String:
      return IsString();
    case Number:
      return IsNumber();
    case Boolean:
      return IsBoolean();
    case Array:
      return IsArray();
    case Object:
      return IsObject();
    default:
      return null;
  }
}
