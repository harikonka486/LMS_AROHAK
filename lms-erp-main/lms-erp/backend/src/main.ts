import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
