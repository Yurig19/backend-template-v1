import {
  DeleteObjectCommand,
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
  NotFoundException,
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

  /**
   * Sanitizes a file name by replacing invalid characters with underscores.
   * @param name Original file name to sanitize
   * @returns Sanitized file name
   */
  private sanitizeFileName(name: string): string {
    return name.replace(/[^\w.-]+/g, '_');
  }

  /**
   * Uploads a single file to S3 storage.
   * @param file File to upload (Express Multer file object)
   * @param isPublic Whether the file should be publicly accessible (default: true)
   * @returns Object containing fileKey and fileUrl
   */
  async uploadFile(file: Express.Multer.File, isPrivate = false) {
    try {
      if (!file) {
        throw new BadRequestException('No file was uploaded.');
      }

      const sanitizedFileName = this.sanitizeFileName(file.originalname);
      const fileKey = isPrivate
        ? `private/${Date.now()}-${sanitizedFileName}`
        : `public/${Date.now()}-${sanitizedFileName}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ...(isPublic ? { ACL: ObjectCannedACL.public_read } : {}),
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      // const cleanEndpoint = (this.awsEndpoint ?? '').replace(/\/+$/, '');
      // const filePublicUrl = this.awsEndpoint
      //   ? `${cleanEndpoint}/${this.bucketName}/${fileKey}`
      //   : `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}`;

      const filePublicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}`;

      const fileSignedUrl = isPrivate
        ? await this.generateSignedUrl(fileKey)
        : null;

      return {
        fileKey,
        fileUrl: isPrivate ? fileSignedUrl : filePublicUrl,
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

  /**
   * Uploads multiple files to S3 storage in parallel.
   * @param files Array of files to upload (Express Multer file objects)
   * @param isPublic Whether the files should be publicly accessible (default: true)
   * @returns Array of objects containing fileKey and fileUrl for each file
   */
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

  /**
   * Generates a presigned URL for accessing a private file.
   * @param fileKey S3 key of the file
   * @returns Presigned URL that expires in 1 hour
   */
  async generateSignedUrl(fileKey: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); /// 1h
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

  /**
   * Deletes a file from S3 storage.
   * @param fileKey S3 key of the file to delete
   * @returns Object containing success message and fileKey
   */
  async deleteFile(fileKey: string) {
    try {
      if (!fileKey) {
        throw new BadRequestException('File key must be provided.');
      }

      const deleteParams = {
        Bucket: this.bucketName,
        Key: fileKey,
      };

      await this.s3Client.send(new DeleteObjectCommand(deleteParams));

      this.logger.log(`File deleted successfully: ${fileKey}`);

      return {
        message: 'File deleted successfully.',
        fileKey,
      };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);

      if (error.name === 'NoSuchKey') {
        throw new NotFoundException('The specified file does not exist.');
      }

      if (error.name === 'CredentialsError' || error.name === 'AccessDenied') {
        throw new InternalServerErrorException(
          'S3 access credentials failure.'
        );
      }

      throw new InternalServerErrorException('Error deleting file.');
    }
  }
}
