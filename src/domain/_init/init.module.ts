import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { RolesService } from '../roles/services/roles.service';
import { UserService } from '../users/services/user.service';
import { UserModule } from '../users/users.module';

@Module({
  imports: [RolesModule, UserModule],
})
export class InitModule implements OnModuleInit {
  private readonly logger = new Logger(InitModule.name);

  constructor(
    private readonly rolesService: RolesService,
    private readonly userService: UserService
  ) {}

  async onModuleInit() {
    this.logger.log('Running application initializations...');
    await this.init();
    this.logger.log('Initialization completed.');
  }

  async init() {
    await this.rolesService.initRoles();
    await this.userService.initAdminUser();
  }
}
