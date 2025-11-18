import { applyDecorators } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

export function ApiController(path: string): ClassDecorator {
  const config = new ConfigService();

  const version = config.get<string>('API_VERSION') || 'v1';
  const capitalizedTag = path.charAt(0).toUpperCase() + path.slice(1);

  return applyDecorators(
    ApiTags(capitalizedTag),
    Controller({ path, version })
  );
}
