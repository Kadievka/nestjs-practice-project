import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UserSchema } from './user.model';
import { UsersService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { authConstants } from '../auth/auth.constants';
import { JwtStrategy } from '../auth/jwt.strategy';
@Module({
  imports: [
    JwtModule.register({ secret: authConstants.secret }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
