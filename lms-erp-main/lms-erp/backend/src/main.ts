import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });
  
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.CLIENT_URL || 'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ].filter(Boolean);
      // Allow requests with no origin (mobile, Postman) or matching origins
      if (
        !origin ||
        allowed.some((u) => origin.startsWith(u.replace(/\/$/, '')))
      ) {
        callback(null, true);
      } else {
        callback(null, true); // permissive for now — tighten after deploy
      }
    },
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`LMS API → http://localhost:${port}/api`);
}
bootstrap();
