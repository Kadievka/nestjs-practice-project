import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  sendJWT(id: string, email: string): { email: string; jwt: string } {
    const token = this.jwtService.sign({
      email: email,
      sub: id,
    });
    return { email: email, jwt: token };
  }
}
