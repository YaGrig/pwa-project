import { Global, Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import * as redisStore from 'cache-manager-redis-store'

// const isProduction = process.env.NODE_ENV === 'production'

// Create a custom Redis store with the prefix
const redisStoreWithPrefix = {
  create: () => {
    // return redisStore.create({
    //   host: process.env.REDIS_HOST || 'redis',
    //   port: +process.env.REDIS_PORT,
    //   //   ...(isProduction && {
    //   //     password: process.env.REDIS_PASSWORD,
    //   //   }),
    // })
  },
}

@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStoreWithPrefix,
    }),
  ],
})
export default class AppCacheModule {}
