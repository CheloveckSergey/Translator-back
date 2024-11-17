import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as express from "express";
import * as path from "path";

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
  }));
  app.use(cookieParser());
  app.use(express.static(path.resolve('src', 'static', 'images')));
  await app.listen(PORT, () => console.log("СЕРВЕР СТАРТОВАЛ НА ПОРТУ " + PORT));
}
bootstrap();
