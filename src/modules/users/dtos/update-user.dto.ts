import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * Data transfer object for updating a user (PUT operation).
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
