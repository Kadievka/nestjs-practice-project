import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UserSchema } from './user.model';
import { UsersService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { authConstants } from './auth.constants';
@Module({
  imports: [
    JwtModule.register({ secret: authConstants.secret }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
