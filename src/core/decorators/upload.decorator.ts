import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseFilePipeBuilder,
  UnsupportedMediaTypeException,
  UseInterceptors,
  UsePipes,
  applyDecorators,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiPayloadTooLargeResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import {
  PayloadTooLargeErrorDto,
  UnsupportedMediaTypeErrorDto,
} from '../enums/errors/dtos/error.dto';

// 🧠 Tamanho máximo (10 MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Decorator Swagger + interceptor para upload de arquivos
 */
export function FileUploadDecorator(
  fileTypeRegex: RegExp,
  exampleMime: string,
  fieldName = 'file'
) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: (req, file, callback) => {
          if (!file.originalname.match(fileTypeRegex)) {
            return callback(
              new UnsupportedMediaTypeException(
                'Invalid or unsupported file format'
              ),
              false
            );
          }
          callback(null, true);
        },
      })
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
            description: `Upload file (${exampleMime})`,
          },
        },
      },
    }),
    ApiPayloadTooLargeResponse({
      description: 'Payload Too Large - File size exceeds allowed limit',
      type: PayloadTooLargeErrorDto,
    }),
    ApiUnsupportedMediaTypeResponse({
      description:
        'Unsupported Media Type - Invalid or unsupported file format',
      type: UnsupportedMediaTypeErrorDto,
    })
  );
}

/**
 * Cria um pipe de validação para arquivos (tamanho + tipo)
 */
export function createFileValidationPipe(fileTypeRegex: RegExp) {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
      new FileTypeValidator({ fileType: fileTypeRegex }),
    ],
  });
}

export const AnyFileUpload = (fieldName = 'file') =>
  FileUploadDecorator(
    // pdf, doc, docx, xlsx, txt, imagens comuns, zip
    /\.(pdf|doc|docx|xls|xlsx|txt|png|jpg|jpeg|gif|zip|rar|csv|json)$/i,
    'PDF, DOC, DOCX, XLSX, TXT, PNG, JPG, GIF, ZIP, RAR, CSV, JSON files',
    fieldName
  );

// 🎵 Arquivos de áudio
export const AudioUpload = (fieldName = 'file') =>
  FileUploadDecorator(
    /\.(mp3|wav|ogg|aac|flac|m4a)$/i,
    'MP3, WAV, OGG, AAC, FLAC, M4A audio files',
    fieldName
  );

// 🎬 Arquivos de vídeo
export const VideoUpload = (fieldName = 'file') =>
  FileUploadDecorator(
    /\.(mp4|avi|mov|mkv|wmv|flv|webm)$/i,
    'MP4, AVI, MOV, MKV, WMV, FLV, WEBM video files',
    fieldName
  );
