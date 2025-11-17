#!/usr/bin/env ts-node
/* eslint-disable no-template-curly-in-string */
/**
 * Generator: create NestJS module (CQRS style) from prisma schema
 *
 * Usage:
 *   pnpm generate:entity User
 *
 * It reads prisma/schema.prisma, extracts the model block for the provided entity name,
 * and scaffolds a module under src/modules/<entity-lowercase>:
 *
 *  - controller/<entity-lower>.controller.ts
 *  - services/<entity-lower>.service.ts
 *  - dtos/create-<entity-lower>.dto.ts
 *  - dtos/update-<entity-lower>.dto.ts
 *  - dtos/read-<entity-lower>.dto.ts
 *  - dtos/list-<entity-lower>.dto.ts
 *  - dtos/delete-<entity-lower>.dto.ts
 *  - use-cases/commands/*.command.ts
 *  - use-cases/commands/*.handler.ts
 *  - use-cases/queries/*.query.ts
 *  - use-cases/queries/*.handler.ts
 *  - <entity-lower>.module.ts
 *
 * The generated Service uses Prisma types from generated/prisma/client.
 */

import * as fs from 'fs';
import * as path from 'path';

const PRISMA_SCHEMA = path.join(process.cwd(), 'prisma', 'schema.prisma');

function readSchema(): string {
  if (!fs.existsSync(PRISMA_SCHEMA)) {
    console.error(`schema.prisma not found at ${PRISMA_SCHEMA}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(PRISMA_SCHEMA, 'utf8');
  return raw;
}

function extractModel(schema: string, modelName: string) {
  const regex = new RegExp(`model\\s+${modelName}\\s+{([\\s\\S]*?)}`, 'm');
  const match = schema.match(regex);

  if (!match) {
    throw new Error(`Modelo ${modelName} não encontrado no schema.prisma`);
  }

  const content = match[1].trim();
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'));

  const fields = lines.map((line) => {
    // handle lines like: id Int @id @default(autoincrement())
    const parts = line.split(/\s+/);
    const name = parts[0];
    const type = parts[1] || 'String';
    const optional = type.endsWith('?');
    const cleanType = type.replace('?', '');
    const isId = line.includes('@id') || name === 'id';
    const isUpdatedAt = line.includes('@updatedAt') || name === 'updatedAt';
    const isCreatedAt = name === 'createdAt';
    const isRelation =
      line.includes('@relation') ||
      (/[A-Z][A-Za-z0-9_]+/.test(cleanType) &&
        ![
          'String',
          'Int',
          'Float',
          'Boolean',
          'DateTime',
          'Json',
          'Decimal',
          'Bytes',
        ].includes(cleanType));
    const isEnum = line.includes('Enum') || false;

    return {
      raw: line,
      name,
      type: cleanType,
      optional,
      isId,
      isUpdatedAt,
      isCreatedAt,
      isRelation,
      isEnum,
    };
  });

  return fields;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function extractEnumsForEntity(schema: string, fields: any[]) {
  const schemaEnums: Record<string, string[]> = {};

  // 1) Buscar todos enums do schema
  const enumRegex = /enum\s+(\w+)\s+{([^}]+)}/g;
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let match;

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((match = enumRegex.exec(schema)) !== null) {
    const enumName = match[1];
    const enumValues = match[2]
      .split('\n')
      .map((v) => v.trim())
      .filter((v) => v && !v.startsWith('//'))
      .map((v) => v.replace(/,/, ''));

    schemaEnums[enumName] = enumValues;
  }

  // 2) Filtrar somente os enums usados pelos campos da entidade
  const usedEnums: Record<string, string[]> = {};

  for (const f of fields) {
    if (schemaEnums[f.type]) {
      usedEnums[f.type] = schemaEnums[f.type];
    }
  }

  return usedEnums;
}

function pascalCase(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str: string) {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function kebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string) {
  fs.writeFileSync(p, content, { encoding: 'utf8' });
  console.log(`  created: ${p}`);
}

/* ===========================================================
   TYPE MAP
=========================================================== */
function mapTsType(prismaType: string, enums: Record<string, string[]>) {
  if (enums[prismaType]) {
    return prismaType; // enum real
  }

  const base = prismaType.replace('?', '');

  switch (base) {
    case 'String':
      return 'string';
    case 'Int':
    case 'Float':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'DateTime':
      return 'Date';
    case 'Json':
      return 'any';
    case 'Decimal':
      return 'number';
    default:
      return base;
  }
}

/* -------------------------------------------------------------------------- */
/*                           Generate Create DTO                               */
/* -------------------------------------------------------------------------- */
/**
 * Generates a Create DTO based on model fields.
 * - Removes uuid, id, createdAt, updatedAt, deletedAt
 * - Adds ApiProperty with example and description
 * - Relations default to string (uuid)
 */
function generateDtoCreate(
  entity: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  fields: any[],
  enums: Record<string, string[]>
) {
  const lower = camelCase(entity);

  const lines = fields
    .filter(
      (f) =>
        !['uuid', 'id', 'createdAt', 'updatedAt', 'deletedAt'].includes(f.name)
    )
    .map((f) => {
      const isEnum = enums[f.type] !== undefined;

      const tsType = isEnum ? f.type : mapTsType(f.type, enums);

      const jsType = isEnum
        ? f.type
        : tsType === 'string'
          ? 'String'
          : tsType === 'number'
            ? 'Number'
            : tsType === 'boolean'
              ? 'Boolean'
              : tsType === 'Date'
                ? 'Date'
                : 'String';

      const isUuid = /uuid$/i.test(f.name);

      return `  @ApiParamDecorator({
      type: ${jsType},
      required: ${f.optional ? 'false' : 'true'},
      description: '${f.name} field of the ${entity} model',
      example: ${isEnum ? `${f.type}.${enums[f.type][0]}` : generateExample(tsType)},
      ${isEnum ? `enumName: "${f.type}",` : ''}
      isUuid: ${isUuid},
    })
    ${f.name}${f.optional ? '?:' : ':'} ${tsType};`;
    })
    .join('\n\n');

  // se houver enums usados, importe do arquivo ../enums/<lower>.enums
  const enumImports = Object.keys(enums).length
    ? `import { ${Object.keys(enums).join(', ')} } from '../enums/${lower}.enums';`
    : '';

  return `import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
${enumImports}

/**
 * Create DTO for ${entity}.
 * Used for POST operations.
 */
export class Create${entity}Dto {
${lines.length ? lines : '  // no writable fields detected'}
}
`;
}

/* -------------------------------------------------------------------------- */
/*                           Generate Update DTO                               */
/* -------------------------------------------------------------------------- */
/**
 * Generates the Update DTO using PartialType(CreateXDto).
 * - All fields become optional automatically
 * - Compatible with Swagger
 */

function generateDtoUpdate(entity: string) {
  const lower = camelCase(entity);
  return `import { PartialType } from '@nestjs/swagger';
  import { Create${entity}Dto } from './create-${lower}.dto';
  
  /**
   * Update DTO for ${entity}.
   * Automatically creates a partial version of the Create DTO.
   * Used for PUT/PATCH operations.
   */
  export class Update${entity}Dto extends PartialType(Create${entity}Dto) {}
  `;
}

/* -------------------------------------------------------------------------- */
/*                            Generate Read DTO                                */
/* -------------------------------------------------------------------------- */
/**
 * Generates the Read DTO containing all model fields.
 * Includes examples and descriptions.
 */
function generateDtoRead(
  entity: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  fields: any[],
  enums: Record<string, string[]>
) {
  const lower = camelCase(entity);

  const lines = fields
    .map((f) => {
      const isEnum = enums[f.type] !== undefined;

      const tsType = isEnum ? 'string' : mapTsType(f.type, enums);

      const jsType = isEnum
        ? f.type
        : tsType === 'string'
          ? 'String'
          : tsType === 'number'
            ? 'Number'
            : tsType === 'boolean'
              ? 'Boolean'
              : tsType === 'Date'
                ? 'Date'
                : 'String';

      const isUuid = /uuid$/i.test(f.name);

      return `  @ApiParamDecorator({
      type: ${jsType},
      required: true,
      description: '${f.name} field of the ${entity} model',
      example: ${
        isEnum ? `${f.type}.${enums[f.type][0]}` : generateExample(tsType)
      },
      ${isEnum ? `enumName: "${f.type}",` : ''}
      isUuid: ${isUuid},
    })
    ${f.name}: ${tsType};`;
    })
    .join('\n\n');

  const enumImports = Object.keys(enums).length
    ? `import { ${Object.keys(enums).join(', ')} } from '../enums/${lower}.enums';`
    : '';

  return `import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
${enumImports}

/**
 * Read DTO for ${entity}.
 * Used when returning an entity from the API.
 */
export class Read${entity}Dto {
${lines}
}
`;
}

/* -------------------------------------------------------------------------- */
/*                            Generate List DTO                                */
/* -------------------------------------------------------------------------- */
/**
 * Standard paginated list DTO generator.
 */
function generateDtoList(entity: string) {
  const lower = camelCase(entity);

  return `import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
    import { Read${entity}Dto } from './read-${lower}.dto';
    
    /**
     * Represents a single item in the ${entity} list.
     */
    export class Read${entity}ListDto extends Read${entity}Dto {}
    
    /**
     * Paginated list DTO for ${entity}.
     */
    export class List${entity}Dto {
  
      @ApiParamDecorator({
        type: Array,
        required: true,
        description: 'List of ${entity} records',
        example: [],
      })
      data: Read${entity}ListDto[];
    
      @ApiParamDecorator({
        type: Number,
        required: true,
        description: 'Current page number',
        example: 1,
      })
      actualPage: number;
    
      @ApiParamDecorator({
        type: Number,
        required: true,
        description: 'Total number of records found',
        example: 20,
      })
      total: number;
    
      @ApiParamDecorator({
        type: Number,
        required: true,
        description: 'Total number of available pages',
        example: 2,
      })
      totalPages: number;
    }
    `;
}

/* -------------------------------------------------------------------------- */
/*                          Generate enum files                                */
/* -------------------------------------------------------------------------- */
function generateEnumFile(entity: string, enums: Record<string, string[]>) {
  const enumNames = Object.keys(enums);

  if (enumNames.length === 0) {
    return ''; // entidade não usa enums
  }

  let output = `/**
 * Enums for ${entity} model (autogenerated)
 */
`;

  for (const enumName of enumNames) {
    const values = enums[enumName];

    output += `
export enum ${enumName} {
${values.map((v) => `  ${v} = "${v}",`).join('\n')}
}
`;
  }

  // biome-ignore lint/style/useTemplate: <explanation>
  return output.trim() + '\n';
}

/* -------------------------------------------------------------------------- */
/*                         Helper: Generate Example                             */
/* -------------------------------------------------------------------------- */
/**
 * Generates smart example values based on the type.
 */
function generateExample(type: string) {
  switch (type) {
    case 'string':
      return `'example-value'`;
    case 'number':
      return 123;
    case 'boolean':
      return true;
    case 'Date':
      return `'2025-01-01T00:00:00.000Z'`;
    default:
      return `'example'`;
  }
}

/* ===========================================================
   SERVICE GENERATOR (typed with Prisma)
=========================================================== */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateService(entity: string, fields: any[]) {
  const lower = camelCase(entity);
  const prismaType = entity;
  const entityImport = prismaType;

  return `import { BadRequestException, Injectable, Logger } from '@nestjs/common';
    import { PrismaService } from '@/core/database/prisma.service';
    import { Prisma, ${entityImport} } from 'generated/prisma/client';
    import { Create${entity}Dto } from '../dtos/create-${lower}.dto';
    import { Update${entity}Dto } from '../dtos/update-${lower}.dto';
    
    /**
     * ${entity}Service - typed service using Prisma client
     */
    @Injectable()
    export class ${entity}Service {
      private readonly logger = new Logger(${entity}Service.name);
    
      constructor(private readonly prisma: PrismaService) {}
    
      private ${lower}s = this.prisma.${lower};
  
      /**
       * Checks whether a ${lower} with the provided UUID exists.
       * @param uuid UUID to validate
       * @returns True if UUID exists and is not deleted
       */
      async checkUuid(uuid: string): Promise<boolean> {
        try {
          const count = await this.${lower}s.count({
            where: { deletedAt: null, uuid },
          });
          return count > 0;
        } catch (error) {
          this.logger.error(\`Failed to check uuid for ${entity}: \${uuid}\`, error);
          throw new BadRequestException('Failed to validate uuid.');
        }
      }
    
      /**
       * Creates a new ${lower}.
       * @param createDto DTO containing ${lower} creation data
       * @returns The created ${lower}
       */
      async create(createDto: Create${entity}Dto): Promise<${entityImport}> {
        try {
          return await this.${lower}s.create({
            data: createDto,
          });
        } catch (error) {
          this.logger.error('Failed to create ${entity}', error);
          throw new BadRequestException('Failed to create ${entity}.');
        }
      }
    
      /**
       * Updates an existing ${lower}.
       * @param uuid UUID of the record to update
       * @param updateDto DTO containing updated data
       * @returns Updated ${lower} data
       */
      async update(uuid: string, updateDto: Update${entity}Dto): Promise<${entityImport}> {
        try {
          return await this.${lower}s.update({
            where: { uuid },
            data: updateDto,
          });
        } catch (error) {
          this.logger.error(\`Failed to update ${entity}: \${uuid}\`, error);
          throw new BadRequestException('Failed to update ${entity}.');
        }
      }
    
      /**
       * Deletes a ${lower} by its UUID.
       * @param uuid UUID of the record to delete
       */
      async delete(uuid: string): Promise<void> {
        try {
          await this.${lower}s.delete({ where: { uuid } });
        } catch (error) {
          this.logger.error(\`Failed to delete ${entity}: \${uuid}\`, error);
          throw new BadRequestException('Failed to delete ${entity}.');
        }
      }
    
      /**
       * Retrieves a ${lower} by UUID.
       * @param uuid UUID of the record
       * @returns The found ${lower} or null
       */
      async findByUuid(uuid: string): Promise<${entityImport} | null> {
        try {
          return await this.${lower}s.findUnique({ where: { uuid } });
        } catch (error) {
          this.logger.error(\`Failed to find ${entity} by uuid: \${uuid}\`, error);
          throw new BadRequestException('Failed to retrieve ${entity}.');
        }
      }
    
      /**
       * Retrieves a paginated list of ${lower} records.
       * Applies optional search filtering.
       * @param page Page number
       * @param dataPerPage Items per page
       * @param search Optional search text
       * @returns Paginated result containing data, total count and page info
       */
      async listWithPagination(
        page = 1,
        dataPerPage = 10,
        search?: string
      ): Promise<{
        data: ${entityImport}[];
        total: number;
        totalPages: number;
        actualPage: number;
      }> {
        try {
          const take = dataPerPage;
          const skip = (page - 1) * take;
    
          const where: Prisma.${prismaType}WhereInput = {};
    
          ${
            fields.some((f) => f.name === 'name')
              ? "if (search) { where['name'] = { contains: search, mode: 'insensitive' }; }"
              : "if (search) { where['uuid'] = { contains: search, mode: 'insensitive' }; }"
          }
    
          const [data, total] = await this.prisma.$transaction([
            this.${lower}s.findMany({ where, skip, take, orderBy: [{ createdAt: 'desc' }] }),
            this.${lower}s.count({ where }),
          ]);
    
          const totalPages = Math.max(Math.ceil(total / take), 1);
    
          return { data, total, totalPages, actualPage: page };
        } catch (error) {
          this.logger.error('Failed to list ${entity}', error);
          throw new BadRequestException('Failed to retrieve ${entity} list.');
        }
      }
    }
    `;
}

/* ===========================================================
   COMMANDS / QUERIES & HANDLERS
=========================================================== */

function generateCommandCreate(entity: string) {
  const lower = camelCase(entity);
  return `import { ICommand } from '@nestjs/cqrs';
import { Create${entity}Dto } from '../../dtos/create-${lower}.dto';

export class Create${entity}Command implements ICommand {
  constructor(public readonly create${entity}Dto: Create${entity}Dto) {}
}
`;
}

function generateCommandUpdate(entity: string) {
  const lower = camelCase(entity);
  return `import { ICommand } from '@nestjs/cqrs';
import { Update${entity}Dto } from '../../dtos/update-${lower}.dto';

export class Update${entity}Command implements ICommand {
  constructor(public readonly uuid: string, public readonly update${entity}Dto: Update${entity}Dto) {}
}
`;
}

function generateCommandDelete(entity: string) {
  return `import { ICommand } from '@nestjs/cqrs';

export class Delete${entity}Command implements ICommand {
  constructor(public readonly uuid: string) {}
}
`;
}

function generateQueryByUuid(entity: string) {
  return `import { IQuery } from '@nestjs/cqrs';

export class ${entity}ByUuidQuery implements IQuery {
  constructor(public readonly uuid: string) {}
}
`;
}

function generateQueryList(entity: string) {
  return `import { IQuery } from '@nestjs/cqrs';

export class List${entity}Query implements IQuery {
  constructor(
    public readonly page: number,
    public readonly dataPerPage: number,
    public readonly search?: string
  ) {}
}
`;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateHandlerCreate(entity: string, fields: any[]) {
  const lower = camelCase(entity);

  // Gera todos os campos da entidade para o retorno do DTO
  const returnFields = fields
    .map((f) => `        ${f.name}: created.${f.name},`)
    .join('\n');

  return `import { BadRequestException } from '@nestjs/common';
  import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
  import type { Read${entity}Dto } from '../../dtos/read-${lower}.dto';
  import { ${entity}Service } from '../../services/${lower}.service';
  import { Create${entity}Command } from './create-${lower}.command';
  
  @CommandHandler(Create${entity}Command)
  export class Create${entity}Handler implements ICommandHandler<Create${entity}Command> {
    constructor(private readonly ${lower}Service: ${entity}Service) {}
  
    /**
     * Handles the create ${lower} command by creating a new ${lower}.
     * @param command Create ${lower} command containing data
     * @returns Created ${lower} data
     */
    async execute(command: Create${entity}Command): Promise<Read${entity}Dto> {
      const { create${entity}Dto } = command;
  
      const created = await this.${lower}Service.create(create${entity}Dto);
  
      if (!created) {
        throw new BadRequestException(
          '${entity} could not be created. Please verify the provided data.'
        );
      }
  
      return <Read${entity}Dto>{
  ${returnFields}
      };
    }
  }
  `;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateHandlerUpdate(entity: string, fields: any[]) {
  const lower = camelCase(entity);

  // Mapeia todos os campos da entidade no retorno
  const returnFields = fields
    .map((f) => `      ${f.name}: updated.${f.name},`)
    .join('\n');

  return `import { BadRequestException, NotFoundException } from '@nestjs/common';
  import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
  import { Update${entity}Command } from './update-${lower}.command';
  import { ${entity}Service } from '../../services/${lower}.service';
  import { Read${entity}Dto } from '../../dtos/read-${lower}.dto';
  
  @CommandHandler(Update${entity}Command)
  export class Update${entity}Handler implements ICommandHandler<Update${entity}Command> {
    constructor(private readonly ${lower}Service: ${entity}Service) {}
  
    /**
     * Handles the update ${lower} command by updating the entity.
     * @param command Update command containing entity UUID and update data
     * @returns Updated ${entity} data
     */
    async execute(command: Update${entity}Command): Promise<Read${entity}Dto> {
      const { uuid, update${entity}Dto } = command;
  
      if (!(await this.${lower}Service.checkUuid(uuid))) {
        throw new NotFoundException('${entity} not found');
      }
  
      const updated = await this.${lower}Service.update(uuid, update${entity}Dto);
  
      if (!updated) {
        throw new BadRequestException(
          'Failed to update ${entity}. Entity may not exist or update failed.'
        );
      }
  
      return <Read${entity}Dto>{
  ${returnFields}
      };
    }
  }
  `;
}

function generateHandlerDelete(entity: string) {
  const lower = camelCase(entity);

  return `import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
  import { Delete${entity}Command } from './delete-${lower}.command';
  import { ${entity}Service } from '../../services/${lower}.service';
  import { DeleteDto } from '@/core/dtos/delete.dto';
  import { BadRequestException, NotFoundException } from '@nestjs/common';
  
  @CommandHandler(Delete${entity}Command)
  export class Delete${entity}Handler implements ICommandHandler<Delete${entity}Command> {
    constructor(private readonly service: ${entity}Service) {}
  
    async execute(command: Delete${entity}Command): Promise<DeleteDto> {
      const { uuid } = command;
  
      try {
        // Check existence before deletion
        if (!(await this.service.checkUuid(uuid))) {
          throw new NotFoundException('${entity} not found');
        }
  
        await this.service.delete(uuid);
  
        return {
          success: true,
          message: '${entity} deleted successfully!',
          statusCode: 200,
        };
  
      } catch (error) {
        throw new BadRequestException('Failed to delete ${entity}.');
      }
    }
  }
  `;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateHandlerByUuid(entity: string, fields: any[]) {
  const lower = camelCase(entity);

  // Gera todos os campos manualmente
  const returnFields = fields
    .map((f) => `      ${f.name}: found.${f.name},`)
    .join('\n');

  return `import { NotFoundException } from '@nestjs/common';
  import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
  import type { Read${entity}Dto } from '../../dtos/read-${lower}.dto';
  import { ${entity}Service } from '../../services/${lower}.service';
  import { ${entity}ByUuidQuery } from './${lower}-by-uuid.query';
  
  @QueryHandler(${entity}ByUuidQuery)
  export class ${entity}ByUuidHandler implements IQueryHandler<${entity}ByUuidQuery> {
    constructor(private readonly ${lower}Service: ${entity}Service) {}
  
    /**
     * Handles the get-by-uuid query by retrieving a ${lower} by UUID.
     * @param query Contains the UUID of the ${lower}
     * @returns ${entity} data if found
     */
    async execute(query: ${entity}ByUuidQuery): Promise<Read${entity}Dto> {
      const { uuid } = query;
  
      const found = await this.${lower}Service.findByUuid(uuid);
  
      if (!found) {
        throw new NotFoundException('${entity} not found.');
      }
  
      return <Read${entity}Dto>{
  ${returnFields}
      };
    }
  }
  `;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateHandlerList(entity: string, fields: any[]) {
  const lower = camelCase(entity);

  // Gera todos os campos manualmente
  const returnFields = fields
    .map((f) => `                ${f.name}: item.${f.name},`)
    .join('\n');

  return `import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
  import { List${entity}Dto, Read${entity}ListDto } from '../../dtos/list-${lower}.dto';
  import { ${entity}Service } from '../../services/${lower}.service';
  import { List${entity}Query } from './list-${lower}.query';
  
  @QueryHandler(List${entity}Query)
  export class List${entity}Handler implements IQueryHandler<List${entity}Query> {
    constructor(private readonly service: ${entity}Service) {}
  
    /**
     * Handles the list ${lower} query by retrieving a paginated list of ${lower}.
     * @param query Contains pagination and search parameters
     * @returns Paginated list of ${lower}
     */
    async execute(query: List${entity}Query): Promise<List${entity}Dto> {
      const { page, dataPerPage, search } = query;
  
      const { actualPage, data, total, totalPages } =
        await this.service.listWithPagination(page, dataPerPage, search);
  
      return {
        data: Array.isArray(data)
          ? data.map(
              (item) =>
                <Read${entity}ListDto>{
  ${returnFields}
                }
            )
          : [],
        actualPage,
        total,
        totalPages,
      };
    }
  }
  `;
}

/* ===========================================================
   Controller generator (with isAuth, description, operationId, responseType and successDescription)
=========================================================== */

function generateController(entity: string) {
  const lower = camelCase(entity);
  const op = (name: string) => `${name}${entity}`;

  return `import { ApiController } from '@/core/decorators/api-controller.decorator';
  import { ApiEndpoint } from '@/core/decorators/methods.decorator';
  import { Body, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
  import { CommandBus, QueryBus } from '@nestjs/cqrs';
  
  import { Create${entity}Dto } from '../dtos/create-${lower}.dto';
  import { Update${entity}Dto } from '../dtos/update-${lower}.dto';
  import { Read${entity}Dto } from '../dtos/read-${lower}.dto';
  import { List${entity}Dto } from '../dtos/list-${lower}.dto';
  import { DeleteDto } from '@/core/dtos/delete.dto';

  
  import { Create${entity}Command } from '../use-cases/commands/create-${lower}.command';
  import { Update${entity}Command } from '../use-cases/commands/update-${lower}.command';
  import { Delete${entity}Command } from '../use-cases/commands/delete-${lower}.command';
  
  import { ${entity}ByUuidQuery } from '../use-cases/queries/${lower}-by-uuid.query';
  import { List${entity}Query } from '../use-cases/queries/list-${lower}.query';
  
  @ApiController('${lower}')
  export class ${entity}Controller {
    constructor(
      private readonly commandBus: CommandBus,
      private readonly queryBus: QueryBus
    ) {}
  
    @ApiEndpoint({
      isAuth: true,
      method: 'POST',
      path: '/create',
      summary: 'Create ${entity}',
      description: 'Creates a new ${entity}.',
      operationId: '${op('create')}',
      bodyType: Create${entity}Dto,
      responseType: Read${entity}Dto,
      successDescription: '${entity} successfully created',
    })
    async create(@Body() createDto: Create${entity}Dto): Promise<Read${entity}Dto> {
      return this.commandBus.execute(new Create${entity}Command(createDto));
    }
  
    @ApiEndpoint({
      isAuth: true,
      method: 'GET',
      path: '/find-by-uuid',
      summary: 'Find ${entity} by UUID',
      description: 'Retrieves a ${entity} by UUID.',
      operationId: '${op('findByUuid')}',
      responseType: Read${entity}Dto,
      successDescription: '${entity} successfully found',
      queries: [
        { name: 'uuid', type: String, required: true, description: '${entity} UUID' }
      ],
    })
    async getByUuid(
      @Query('uuid', ParseUUIDPipe) uuid: string
    ): Promise<Read${entity}Dto> {
      return this.queryBus.execute(new ${entity}ByUuidQuery(uuid));
    }
  
    @ApiEndpoint({
      isAuth: true,
      method: 'GET',
      path: '/list',
      summary: 'List ${entity}',
      description: 'List ${entity} with pagination and optional search.',
      operationId: '${op('list')}',
      responseType: List${entity}Dto,
      successDescription: '${entity} list retrieved',
      queries: [
        { name: 'page', type: Number, required: true, description: 'Page number' },
        { name: 'dataPerPage', type: Number, required: true, description: 'Items per page' },
        { name: 'search', type: String, required: false, description: 'Optional search term' },
      ],
    })
    async list(
      @Query('page', ParseIntPipe) page: number,
      @Query('dataPerPage', ParseIntPipe) dataPerPage: number,
      @Query('search') search?: string
    ): Promise<List${entity}Dto> {
      return this.queryBus.execute(new List${entity}Query(page, dataPerPage, search));
    }
  
    @ApiEndpoint({
      isAuth: true,
      method: 'PUT',
      path: '/update',
      summary: 'Update ${entity}',
      description: 'Update an existing ${entity}.',
      operationId: '${op('update')}',
      bodyType: Update${entity}Dto,
      responseType: Read${entity}Dto,
      successDescription: '${entity} successfully updated',
      queries: [
        { name: 'uuid', type: String, required: true, description: '${entity} UUID' }
      ],
    })
    async update(
      @Query('uuid', ParseUUIDPipe) uuid: string,
      @Body() updateDto: Update${entity}Dto
    ): Promise<Read${entity}Dto> {
      return this.commandBus.execute(new Update${entity}Command(uuid, updateDto));
    }
  
    @ApiEndpoint({
      isAuth: true,
      method: 'DELETE',
      path: '/delete',
      summary: 'Delete ${entity}',
      description: 'Deletes the ${entity} associated with the given UUID.',
      operationId: '${op('delete')}',
      responseType: DeleteDto,
      successDescription: '${entity} successfully deleted',
      queries: [
        { name: 'uuid', type: String, required: true, description: '${entity} UUID' }
      ],
    })
    async delete(@Query('uuid', ParseUUIDPipe) uuid: string): Promise<DeleteDto> {
      return this.commandBus.execute(new Delete${entity}Command(uuid));
    }
  }
  `;
}

/* ===========================================================
   Module generator
=========================================================== */

function generateModule(entity: string) {
  const lower = camelCase(entity);

  return `import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ${entity}Controller } from './controller/${lower}.controller';
import { ${entity}Service } from './services/${lower}.service';

import { Create${entity}Handler } from './use-cases/commands/create-${lower}.handler';
import { Update${entity}Handler } from './use-cases/commands/update-${lower}.handler';
import { Delete${entity}Handler } from './use-cases/commands/delete-${lower}.handler';

import { List${entity}Handler } from './use-cases/queries/list-${lower}.handler';
import { ${entity}ByUuidHandler } from './use-cases/queries/${lower}-by-uuid.handler';

const handlers = [
  Create${entity}Handler,
  Update${entity}Handler,
  Delete${entity}Handler,
  //
  ${entity}ByUuidHandler,
  List${entity}Handler,
];

@Module({
  imports: [CqrsModule],
  controllers: [${entity}Controller],
  providers: [
    ${entity}Service,
    ...handlers,
  ],
  exports: [${entity}Service],
})
export class ${entity}Module {}
`;
}

/* ===========================================================
   MAIN
=========================================================== */

const entity = process.argv[2];
if (!entity) {
  console.error('Uso: pnpm generate:entity User');
  process.exit(1);
}

const schema = readSchema();
const fields = extractModel(schema, entity);
const enums = extractEnumsForEntity(schema, fields);
const lower = camelCase(entity);
const base = path.join(process.cwd(), 'src', 'modules', lower);

console.log(`Generating entity: ${entity}`);
ensureDir(base);
ensureDir(path.join(base, 'controller'));
ensureDir(path.join(base, 'services'));
ensureDir(path.join(base, 'dtos'));
ensureDir(path.join(base, 'enums'));
ensureDir(path.join(base, 'use-cases', 'commands'));
ensureDir(path.join(base, 'use-cases', 'queries'));

/* DTOs */
writeFile(
  path.join(base, 'dtos', `create-${lower}.dto.ts`),
  generateDtoCreate(entity, fields, enums)
);
writeFile(
  path.join(base, 'dtos', `update-${lower}.dto.ts`),
  generateDtoUpdate(entity)
);
writeFile(
  path.join(base, 'dtos', `read-${lower}.dto.ts`),
  generateDtoRead(entity, fields, enums)
);
writeFile(
  path.join(base, 'dtos', `list-${lower}.dto.ts`),
  generateDtoList(entity)
);

if (Object.keys(enums).length > 0) {
  writeFile(
    path.join(base, 'enums', `${lower}.enums.ts`),
    generateEnumFile(entity, enums)
  );
}

/* Service */
writeFile(
  path.join(base, 'services', `${lower}.service.ts`),
  generateService(entity, fields)
);

/* Commands */
writeFile(
  path.join(base, 'use-cases', 'commands', `create-${lower}.command.ts`),
  generateCommandCreate(entity)
);
writeFile(
  path.join(base, 'use-cases', 'commands', `update-${lower}.command.ts`),
  generateCommandUpdate(entity)
);
writeFile(
  path.join(base, 'use-cases', 'commands', `delete-${lower}.command.ts`),
  generateCommandDelete(entity)
);

/* Command handlers */
writeFile(
  path.join(base, 'use-cases', 'commands', `create-${lower}.handler.ts`),
  generateHandlerCreate(entity, fields)
);
writeFile(
  path.join(base, 'use-cases', 'commands', `update-${lower}.handler.ts`),
  generateHandlerUpdate(entity, fields)
);
writeFile(
  path.join(base, 'use-cases', 'commands', `delete-${lower}.handler.ts`),
  generateHandlerDelete(entity)
);

/* Queries */
writeFile(
  path.join(base, 'use-cases', 'queries', `${lower}-by-uuid.query.ts`),
  generateQueryByUuid(entity)
);
writeFile(
  path.join(base, 'use-cases', 'queries', `list-${lower}.query.ts`),
  generateQueryList(entity)
);

/* Query handlers */
writeFile(
  path.join(base, 'use-cases', 'queries', `${lower}-by-uuid.handler.ts`),
  generateHandlerByUuid(entity, fields)
);
writeFile(
  path.join(base, 'use-cases', 'queries', `list-${lower}.handler.ts`),
  generateHandlerList(entity, fields)
);

/* Controller */
writeFile(
  path.join(base, 'controller', `${lower}.controller.ts`),
  generateController(entity)
);

/* Module */
writeFile(path.join(base, `${lower}.module.ts`), generateModule(entity));

console.log(`✔ Entidade ${entity} gerada com sucesso em src/modules/${lower}`);
