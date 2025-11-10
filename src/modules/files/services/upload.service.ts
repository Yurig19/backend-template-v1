import {
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;

  private awsEndpoint = this.configService.get<string>('AWS_ENDPOINT');
  private forcePathStyle =
    this.configService.get<string>('AWS_S3_FORCE_PATH_STYLE') === 'true';
  private accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
  private secretAccessKey = this.configService.get<string>(
    'AWS_SECRET_ACCESS_KEY'
  );
  private region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
  private bucketName = this.configService.get<string>('AWS_S3_BUCKET');

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.region,
      endpoint: this.awsEndpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
      forcePathStyle: this.forcePathStyle,
    });
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^\w.-]+/g, '_');
  }

  async uploadFile(file: Express.Multer.File, isPublic = true) {
    try {
      if (!file) {
        throw new BadRequestException('No file was uploaded.');
      }

      const sanitizedFileName = this.sanitizeFileName(file.originalname);
      const fileKey = `${Date.now()}-${sanitizedFileName}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ...(isPublic ? { ACL: ObjectCannedACL.public_read } : {}),
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      const cleanEndpoint = (this.awsEndpoint ?? '').replace(/\/+$/, '');
      const filePublicUrl = this.awsEndpoint
        ? `${cleanEndpoint}/${this.bucketName}/${fileKey}`
        : `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}`;

      const fileSignedUrl = !isPublic
        ? await this.generateSignedUrl(fileKey)
        : null;

      return {
        fileKey,
        fileUrl: isPublic ? filePublicUrl : fileSignedUrl,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      if (error.name === 'CredentialsError' || error.name === 'AccessDenied') {
        throw new InternalServerErrorException(
          'S3 access credentials failure.'
        );
      }
      throw new InternalServerErrorException('Error uploading file.');
    }
  }

  async uploadFiles(files: Express.Multer.File[], isPublic = true) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files were uploaded.');
      }

      const uploadPromises = files.map((file) =>
        this.uploadFile(file, isPublic)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error(
        `Error during multiple file upload: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error uploading multiple files.');
    }
  }

  async generateSignedUrl(fileKey: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      this.logger.error(
        `Error generating signed URL: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        'Error generating temporary download URL.'
      );
    }
  }
}
