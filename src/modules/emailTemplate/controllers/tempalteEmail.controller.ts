import { ApiController } from '@/core/decorators/api-controller.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

@ApiController('templateEmail')
export class TemplateEmailController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}
}
