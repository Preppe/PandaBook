import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config'; // Corrected import path
import { GeminiConfig } from './config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional() // Make it optional for now, maybe required later
  GEMINI_API_KEY: string;
}

export default registerAs<GeminiConfig>('gemini', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    apiKey: process.env.GEMINI_API_KEY,
  };
});
