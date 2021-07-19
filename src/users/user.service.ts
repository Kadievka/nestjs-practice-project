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
    private readonly jwtService: JwtService,
    @InjectModel('User') private readonly UserModel: Model<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    return this.UserModel.findOne({ email: email });
  }

  async findUserByEmailOrThrowForbidden(email: string): Promise<User> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new ForbiddenException();
    }
    return user;
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

  sendJWT(id, email): { email: string; jwt: string } {
    const token = this.jwtService.sign({
      email: email,
      sub: id,
    });
    return { email: email, jwt: token };
  }

  async login(user: {
    email: string;
    password: string;
  }): Promise<{ email: string; jwt: string }> {
    const foundUser = await this.findUserByEmailOrThrowForbidden(user.email);
    const valid = await foundUser.verifyPassword(user.password);
    if (!valid) {
      throw new ForbiddenException();
    }
    return this.sendJWT(foundUser.id, foundUser.email);
  }

  async sendJwtToResetPassword(email): Promise<{ email: string; jwt: string }> {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    user.password = null;
    await user.save();
    return this.sendJWT(user.id, user.email);
  }

  async updatePassword(user): Promise<{ email: string }> {
    const foundUser = await this.findUserByEmailOrThrowForbidden(user.email);
    if (foundUser.password) {
      throw new ForbiddenException(userErrors.ALREADY_HAVE_PASSWORD);
    }
    foundUser.password = user.password;
    await foundUser.save();
    return { email: foundUser.email };
  }

  async updateProfile(
    email: string,
    information: {
      firstName: string;
      lastName: string;
      cellphone: string;
      address: string;
    },
  ) {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    Object.assign(user, information);
    await user.save();
    return {
      lastName: user.lastName,
      firstName: user.firstName,
      cellphone: user.cellphone,
      address: user.address,
    };
  }
}
