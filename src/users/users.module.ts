import { AuthService } from '../auth/auth.service';
import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UserSchema } from './user.model';
import { UsersService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { authConstants } from '../auth/auth.constants';
import { JwtStrategy } from '../auth/jwt.strategy';
import { RandomService } from 'src/random/random.service';
import { ImagesService } from 'src/images/images.service';
import { ImageSchema } from '../images/image.model';
@Module({
  imports: [
    JwtModule.register({ secret: authConstants.secret }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Image', schema: ImageSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtStrategy,
    AuthService,
    RandomService,
    Logger,
    ImagesService,
  ],
})
export class UsersModule {}
