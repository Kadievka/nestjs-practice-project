import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ImagesModule } from './images/images.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      envFilePath: __dirname + '/../.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_CLUSTER),
    UsersModule,
    ImagesModule,
  ],
  controllers: [],
})
export class AppModule {}
