import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';
import { S3Config } from './config.type';

class EnvironmentVariablesValidator {
  @IsString()
  ACCESS_KEY_ID: string;

  @IsString()
  SECRET_ACCESS_KEY: string;

  @IsString()
  AWS_DEFAULT_S3_BUCKET: string;

  @IsString()
  @IsOptional()
  AWS_DEFAULT_S3_URL: string;

  @IsOptional()
  AWS_S3_REGION?: string;

  @IsString()
  @IsOptional()
  AWS_S3_ENDPOINT?: string;
}

export default registerAs<S3Config>('s3', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    driver: process.env.FILE_DRIVER ?? 's3',
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
    awsDefaultS3Url: process.env.AWS_DEFAULT_S3_URL,
    awsS3Region: process.env.AWS_S3_REGION,
    maxFileSize: 5242880, // 5mb
    awsS3Endpoint: process.env.AWS_S3_ENDPOINT,
  };
});
