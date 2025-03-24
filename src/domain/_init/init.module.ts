import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { RolesService } from '../roles/services/roles.service';
import { RolesModule } from '../roles/roles.module';
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
    this.logger.log('Executando inits da aplicação...');
    this.init();
    this.logger.log('Inicialização concluída.');
  }

  async init() {
    await this.rolesService.initRoles();
    await this.userService.initAdminUser();
  }
}
