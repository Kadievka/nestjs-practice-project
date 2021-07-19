import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly UserModel: Model<User>) {}

  findUserByEmail(email: string) {
    return this.UserModel.findOne({ email: email });
  }

  async registerUser(user: {
    email: string;
    password: string;
  }): Promise<{ email: string }> {
    const foundUser = await this.findUserByEmail(user.email);
    if (foundUser) {
      throw new BadRequestException('email already taken');
    }
    const createdUser = await this.UserModel.create(user);
    return { email: createdUser.email };
  }
}
