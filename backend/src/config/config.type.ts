export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
};

export type AuthConfig = {
  secret?: string;
  expires?: string;
  refreshSecret?: string;
  refreshExpires?: string;
};

export type DatabaseConfig = {
  url?: string;
  type?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
  synchronize?: boolean;
  maxConnections: number;
  sslEnabled?: boolean;
  rejectUnauthorized?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
};

export type S3Config = {
  driver: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  awsDefaultS3Bucket?: string;
  awsDefaultS3Url?: string;
  awsS3Region?: string;
  maxFileSize: number;
  awsS3Endpoint?: string;
  cdnBaseUrl?: string;
};

export type GoogleConfig = {
  clientId?: string;
  clientSecret?: string;
};

export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
};

// Import RedisConfig type (assuming it's defined in redis.config.ts or similar)
// If RedisConfig is defined in redis.config.ts, we might need to export it from there first.
// Let's assume it's defined like this for now:
export type RedisConfig = {
  host?: string;
  port?: number;
  password?: string;
};

export type GeminiConfig = {
  apiKey?: string;
};

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  s3: S3Config;
  google: GoogleConfig;
  mail: MailConfig;
  redis: RedisConfig; // Added redis config type
  gemini: GeminiConfig; // Added gemini config type
};
