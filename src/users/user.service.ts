import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import userErrors from './user.errors';
import { User } from './user.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    @InjectModel('User') private readonly UserModel: Model<User>,
  ) {}

  findUserByEmail(email: string) {
    return this.UserModel.findOne({ email: email });
  }

  async registerUser(user: {
    email: string;
    password: string;
  }): Promise<{ email: string }> {
    const foundUser = await this.findUserByEmail(user.email);
    if (foundUser) {
      throw new BadRequestException(userErrors.EMAIL_ALREADY_EXIST);
    }
    const createdUser = await this.UserModel.create(user);
    return { email: createdUser.email };
  }

  async login(user: { email: string; password: string }) {
    const foundUser = await this.findUserByEmail(user.email);
    if (!foundUser) {
      throw new ForbiddenException();
    }
    const valid = await foundUser.verifyPassword(user.password);
    if (!valid) {
      throw new ForbiddenException();
    }
    const token = this.jwtService.sign({
      email: foundUser.email,
      sub: foundUser.id,
    });
    return { email: foundUser.email, jwt: token };
  }

  async updatePassword(user) {
    const foundUser = await this.findUserByEmail(user.email);
    if (!foundUser) {
      throw new ForbiddenException();
    }
    foundUser.password = user.password;
    await foundUser.save();
    return { email: foundUser.email };
  }
}
