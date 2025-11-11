import { CreateUserDto } from '@/modules/users/dtos/create-user.dto';

/**
 * Data transfer object for user registration.
 * Extends CreateUserDto to reuse user creation fields.
 */
export class AuthRegisterDto extends CreateUserDto {}
