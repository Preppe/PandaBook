import {
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class S3Service {
  private s3: S3Client;
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const region =
      this.configService.get('s3.awsS3Region', {
        infer: true,
      }) || undefined;

      console.log('region', region);

    this.s3 = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.configService.getOrThrow('s3.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: this.configService.getOrThrow('s3.secretAccessKey', {
          infer: true,
        }),
      },
      endpoint: this.configService.get('s3.awsS3Endpoint', {
        infer: true,
      }),
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, bucket: string, acl?: 'public-read' | 'private') {
    // Check if bucket exists, create if not
    try {
      const buckets = await this.s3.send(new ListBucketsCommand({}));
      if (!buckets.Buckets?.some((b) => b.Name === bucket)) {
        await this.s3.send(
          new CreateBucketCommand({
            Bucket: bucket,
          }),
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(`Failed to check/create bucket: ${error.message}, bucket: ${bucket}`);
    }

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

    if (file.size <= CHUNK_SIZE) {
      // For small files, use simple upload
      try {
        return this.s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: file.originalname,
            ContentType: file.mimetype,
            Body: file.buffer,
            ACL: acl,
          }),
        );
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }

    try {
      // Initialize multipart upload
      const multipartUpload = await this.s3.send(
        new CreateMultipartUploadCommand({
          Bucket: bucket,
          Key: file.originalname,
          ContentType: file.mimetype,
          ACL: acl,
        }),
      );

      const uploadId = multipartUpload.UploadId;
      const parts: { ETag: string; PartNumber: number }[] = [];

      // Split file into chunks and upload
      for (let i = 0; i < file.buffer.length; i += CHUNK_SIZE) {
        const chunk = file.buffer.slice(i, Math.min(i + CHUNK_SIZE, file.buffer.length));
        const partNumber = Math.floor(i / CHUNK_SIZE) + 1;

        const uploadPartResponse = await this.s3.send(
          new UploadPartCommand({
            Bucket: bucket,
            Key: file.originalname,
            UploadId: uploadId,
            Body: chunk,
            PartNumber: partNumber,
          }),
        );

        parts.push({
          ETag: uploadPartResponse.ETag!,
          PartNumber: partNumber,
        });
      }

      // Complete multipart upload
      await this.s3.send(
        new CompleteMultipartUploadCommand({
          Bucket: bucket,
          Key: file.originalname,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        }),
      );

      return { Key: file.originalname };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteFile(key: string, bucket: string) {
    try {
      return this.s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getFile(key: string, bucket: string, range?: string) {
    if (range) {
      try {
        return this.s3.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
            Range: range,
          }),
        );
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }

    try {
      return this.s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
