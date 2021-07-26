import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import userErrors from './user.errors';
import { User } from './user.model';
import { AuthService } from '../auth/auth.service';
import { userConstants } from './user.constants';
import { PaginateModel, PaginateResult } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('User') private readonly UserModel: PaginateModel<User>,
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

  async login(user: {
    email: string;
    password: string;
  }): Promise<{ email: string; jwt: string }> {
    const foundUser = await this.findUserByEmailOrThrowForbidden(user.email);
    const valid = await foundUser.verifyPassword(user.password);
    if (!valid) {
      throw new ForbiddenException();
    }
    return this.authService.sendJWT(foundUser.id, foundUser.email);
  }

  async sendJwtToResetPassword(email): Promise<{ email: string; jwt: string }> {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    user.password = null;
    await user.save();
    return this.authService.sendJWT(user.id, user.email);
  }

  async updatePassword(request, email): Promise<{ email: string }> {
    const foundUser = await this.findUserByEmailOrThrowForbidden(email);
    if (foundUser.password) {
      throw new ForbiddenException(userErrors.ALREADY_HAVE_PASSWORD);
    }
    foundUser.password = request.password;
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

  async getUserProfile(email: string): Promise<{
    email: string;
    isAdmin: boolean;
    lastName: string;
    firstName: string;
    cellphone: string;
    address: string;
  }> {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    return {
      email: user.email,
      isAdmin: user.isAdmin,
      lastName: user.lastName,
      firstName: user.firstName,
      cellphone: user.cellphone,
      address: user.address,
    };
  }

  async verifyIsAdmin(
    email: string,
    throwErrorIfIsNotAdmin: boolean,
  ): Promise<boolean> {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    if (!user.isAdmin && throwErrorIfIsNotAdmin) {
      throw new ForbiddenException(userErrors.IS_NOT_ADMIN);
    }
    return user.isAdmin;
  }

  async getAllUsersToManage(
    email: string,
    page: string,
  ): Promise<PaginateResult<User>> {
    const throwErrorIfIsNotAdmin = true;
    await this.verifyIsAdmin(email, throwErrorIfIsNotAdmin);

    const query = {};

    const options = {
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        isAdmin: true,
      },
      sort: { createdAt: -1 },
      page: page ? parseInt(page) : 1,
      limit: userConstants.DEFAULT_LIMIT_PER_PAGE,
    };

    return this.UserModel.paginate(query, options);
  }
}
