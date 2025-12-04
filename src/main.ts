import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/static/',
  });

  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setDescription('API documentation for Clinic Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.use(
    bodyParser.json({
      limit: '10mb',
      verify: (req: any, res: any, buf: Buffer, encoding: string) => {
        if (req.originalUrl.includes('api/v1/payment/vietqr/webhook')) {
          req.rawBody = buf.toString(encoding as BufferEncoding);
          // console.log('Raw body đã được lưu cho webhook PayOS: ' + req.rawBody);
        }
      },
    }),
  );
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(3000);
}
bootstrap();
