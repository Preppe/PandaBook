import { BullModule } from '@nestjs/bull'; // Import BullModule
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderResolver } from 'nestjs-i18n';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import { AllConfigType } from './config/config.type';
import databaseConfig from './config/database.config';
import fileConfig from './config/s3.config';
import googleConfig from './config/google.config';
import mailConfig from './config/mail.config';
import redisConfig from './config/redis.config'; // Added import
import twitterConfig from './config/twitter.config';
import geminiConfig from './config/gemini.config'; // Import geminiConfig
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ForgotModule } from './forgot/forgot.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from './mailer/mailer.module';
import { SessionModule } from './session/session.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { ScheduleModule } from '@nestjs/schedule'; // Import ScheduleModule
import { S3Module } from './s3/s3.module';
import { ProgressModule } from './progress/progress.module';
// RedisModule might not be needed if only used for Bull, but keep it for now if other parts use it.
import { RedisModule } from './redis/redis.module';
import { GeminiModule } from './gemini/gemini.module'; // Import GeminiModule
// ChaptersModule removed as its functionality is merged into BooksModule

@Module({
  imports: [
    ScheduleModule.forRoot(), // Add ScheduleModule
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
         fileConfig,
         googleConfig,
         twitterConfig,
         redisConfig, // Added redisConfig
         geminiConfig, // Added geminiConfig
       ],
       envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    AuthGoogleModule,
    ForgotModule,
    SessionModule,
    MailModule,
    MailerModule,
    BooksModule,
    S3Module,
    ProgressModule,
    RedisModule, // Keep if needed elsewhere
    GeminiModule, // Add GeminiModule
    // ChaptersModule removed
    BullModule.forRootAsync({ // Add Bull configuration
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AllConfigType>) => ({
        redis: {
          host: configService.get('redis.host', { infer: true }),
          port: configService.get('redis.port', { infer: true }),
          password: configService.get('redis.password', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
