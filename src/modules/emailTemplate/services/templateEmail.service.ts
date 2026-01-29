import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import { handlePrismaError } from '@/core/errors/helpers/prisma-error.helper';
import { prisma } from '@/core/lib/prisma';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EmailTemplate } from 'generated/prisma/client';
import { CreateEmailTemplateDto } from '../dtos/create-templateEmail.dto';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templateEmail = prisma.emailTemplate;

  /**
   * Creates a new email template in the database.
   * @param data Email template data to be created
   * @returns Created email template
   */
  async create(data: CreateEmailTemplateDto): Promise<EmailTemplate> {
    try {
      return await this.templateEmail.create({ data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Initializes email templates from init.json file.
   * Creates only those that don't exist yet.
   */
  async init(): Promise<void> {
    try {
      const filePath = path.resolve(
        process.cwd(),
        'src/modules/emailTemplate/services/init.json'
      );

      if (!existsSync(filePath)) {
        throw new BadRequestException(`File not found: ${filePath}`);
      }

      const templatesData = JSON.parse(readFileSync(filePath, 'utf-8'));

      if (templatesData && Array.isArray(templatesData)) {
        for (const template of templatesData) {
          const existingTemplate = await this.templateEmail.findUnique({
            where: { name: template.name },
          });

          const templateData: CreateEmailTemplateDto = {
            name: template.name,
            subject: template.subject,
            bodyHtml: template.bodyHtml,
            bodyText: template.bodyText,
            variables: template.variables,
            category: template.category,
            description: template.description,
            isActive: template.isActive ?? true,
            version: template.version ?? 1,
          };

          if (!existingTemplate) {
            await this.create(templateData);
            this.logger.log(`✅ Email template created: ${template.name}`);
          } else {
            this.logger.log(
              `ℹ️ Email template already exists: ${template.name}`
            );
          }
        }

        this.logger.log('🚀 Email templates initialized successfully.');
      } else {
        throw new BadRequestException(
          'The init.json file does not contain valid template data.'
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      handlePrismaError(error);
    }
  }
}
