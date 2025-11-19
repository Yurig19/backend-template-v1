import { applyDecorators } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
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
  MaxLength,
  MinLength,
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
  minLength?: number;
  maxLength?: number;
}

export function ApiParamDecorator(opts: ParamOptions) {
  const {
    type,
    required = false,
    description,
    example,
    isUuid,
    enumName,
    maxLength,
    minLength,
  } = opts;
  const isEnumType = isEnum(type);

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

  const apiDecorator = required
    ? ApiProperty(apiPropertyOptions)
    : ApiPropertyOptional(apiPropertyOptions);

  const decorators = [apiDecorator];
  if (type === Date) {
    apiPropertyOptions.format = 'date-time';
  }

  if (!required) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty({ message: 'This field cannot be empty.' }));
  }

  if (isEnumType && typeof type === 'object') {
    const enumValues = Object.values(type).join(', ');
    decorators.push(
      IsEnum(type, {
        message: `Value must be one of the following: ${enumValues}.`,
      })
    );
  } else if (isUuid) {
    decorators.push(IsUUID('4', { message: 'Value must be a valid UUIDv4.' }));
  } else {
    const validationDecorator = getValidationDecorator(type as AllowedTypes);
    if (validationDecorator) {
      decorators.push(validationDecorator);
    }
  }

  if (type === String) {
    if (minLength !== undefined) {
      decorators.push(
        MinLength(minLength, {
          message: `Minimum length is ${minLength} characters.`,
        })
      );
    }
    if (maxLength !== undefined) {
      decorators.push(
        MaxLength(maxLength, {
          message: `Maximum length is ${maxLength} characters.`,
        })
      );
    }
  }

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
      return IsString({ message: 'Value must be a string.' });
    case Number:
      return IsNumber({}, { message: 'Value must be a number.' });
    case Boolean:
      return IsBoolean({ message: 'Value must be a boolean.' });
    case Array:
      return IsArray({ message: 'Value must be an array.' });
    case Object:
      return IsObject({ message: 'Value must be an object.' });
    default:
      return null;
  }
}
