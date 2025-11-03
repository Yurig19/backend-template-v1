import { applyDecorators } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ApiController(path: string): ClassDecorator {
  const capitalizedTag = path.charAt(0).toUpperCase() + path.slice(1);

  return applyDecorators(
    ApiTags(capitalizedTag),
    Controller({ path, version: process.env.API_VERSION })
  );
}
