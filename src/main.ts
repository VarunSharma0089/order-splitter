import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule }             from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ApiKeyGuard }           from './common/guards/api-key.guard';

async function bootstrap() {
  const app    = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalGuards(new ApiKeyGuard(config, app.get(Reflector)));

  //Swagger — only in non-production environments
  if (config.get('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Order Splitter API')
      .setDescription('Robo-Advisor portfolio order splitting service')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'x-api-key')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
    console.log(`📚 Swagger: http://localhost:${config.get('port')}/api`);
  }

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
  console.log(`🚀 API running at http://localhost:${port}`);
  console.log(`🔒 Auth: x-api-key header required`);
}
bootstrap();

