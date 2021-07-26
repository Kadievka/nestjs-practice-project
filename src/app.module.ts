import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      envFilePath: __dirname + '/../.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_CLUSTER),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
