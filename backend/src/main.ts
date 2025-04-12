import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { IoAdapter } from '@nestjs/platform-socket.io'; // Import IoAdapter
import { createAdapter } from '@socket.io/redis-adapter'; // Correct import for v4+
import Redis from 'ioredis'; // Import ioredis
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';


// Custom Redis Adapter
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(configService: ConfigService<AllConfigType>): Promise<void> {
    const redisConfig = configService.get('redis', { infer: true });
    if (!redisConfig) {
      throw new Error('Redis configuration is missing!');
    }
    const pubClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      lazyConnect: true, // Connect explicitly
    });
    const subClient = pubClient.duplicate();

    // Handle connection errors
    pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err));
    subClient.on('error', (err) => console.error('Redis Sub Client Error:', err));

    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
      this.adapterConstructor = createAdapter(pubClient, subClient);
      console.log('Redis adapter connected successfully.');
    } catch (err) {
       console.error('Failed to connect Redis clients for adapter:', err);
       // Decide how to handle adapter connection failure (e.g., throw, fallback)
       throw err; // Rethrow to prevent app start if adapter is critical
    }
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
      console.log('Socket.IO server configured with Redis adapter.');
    } else {
      console.warn('Redis adapter constructor not available. Socket.IO running without adapter.');
    }
    return server;
  }
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { 
    cors: { 
      origin: 'http://localhost:3001', // Specifica l'origine esatta invece di '*'
      credentials: true 
    } 
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  // Setup Redis Adapter
  const redisIoAdapter = new RedisIoAdapter(app); // Pass app instance
  await redisIoAdapter.connectToRedis(configService);
  app.useWebSocketAdapter(redisIoAdapter);


  await app.listen(configService.getOrThrow('app.port', { infer: true }));
  console.log(`Application is running on: ${await app.getUrl()}`); // Log URL
}
void bootstrap();
