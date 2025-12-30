import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationResponseInterceptor } from './common/interceptors/responce.interceptor'
import { GlobalErrorFilter } from './common/exceptions/exception-handler'
import { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(json({ limit: '10mb' }))
  app.use(urlencoded({ extended: true, limit: '10mb' }))
  app.use(cookieParser())

  app.useGlobalInterceptors(new ValidationResponseInterceptor())
  app.useGlobalFilters(new GlobalErrorFilter())

  app.enableCors({
    origin: ['http://localhost:3000', 'http://frontend:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    optionsSuccessStatus: 204,
  })

  await app.listen(process.env.PORT ?? 3001)
}

bootstrap()
