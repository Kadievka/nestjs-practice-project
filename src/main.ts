import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJs Project Practice')
    .setDescription(
      'Here you can find documentation about my netsjs project practice',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.API_DOCS, app, document);
  app.use(express.static(__dirname + '/../public'));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
