import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
}

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  REDIS_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;
}

export default registerAs<RedisConfig>('redis', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.REDIS_HOST ?? 'localhost', // Default to localhost if not set
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379, // Default to 6379 if not set
    password: process.env.REDIS_PASSWORD,
  };
});
