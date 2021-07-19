import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { authConstants } from './auth.constants';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [JwtModule.register({ secret: authConstants.secret })],
  providers: [JwtStrategy],
})
export class AuthModule {}
