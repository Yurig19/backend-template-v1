import { SetMetadata } from '@nestjs/common';

/**
 * Define as roles (perfis de usuário) permitidas para um endpoint.
 * Exemplo: @Roles('admin', 'manager')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
