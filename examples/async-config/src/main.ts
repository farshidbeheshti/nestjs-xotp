import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`async-config example listening on http://localhost:${port}`);
}

bootstrap();
