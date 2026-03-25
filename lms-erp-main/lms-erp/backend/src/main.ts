/**
 * LMS Backend - NestJS Application Entry Point
 * 
 * This is the main bootstrap file for the LMS NestJS backend API.
 * It sets up the NestJS application with global configurations.
 * 
 * Stack: NestJS + TypeScript + MySQL
 * Port: 4000 (default)
 * API Prefix: /api
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Enable global validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Configure CORS for frontend communication
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

  // Start the server
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 LMS NestJS API → http://localhost:${port}/api`);
}

bootstrap();
